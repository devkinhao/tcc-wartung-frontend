import type { ViaCepResponseDTO } from "@/api/cep.api";
import { isValidCnpj, type ReceitaWsResponseDTO } from "@/api/cnpj.api";
import { qk } from "@/api/keys";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Modal } from "@/components/Modal";
import { Tooltip } from "@/components/Tooltip";
import { Button } from "@/components/button/Button";
import { EMPTY_HELPER_TEXT, FormField } from "@/components/form/FormField";
import { useCepLookup } from "@/hooks/useCepLookup";
import { useCnpjLookup, type CnpjLookupStatus } from "@/hooks/useCnpjLookup";
import { useNotify } from "@/hooks/useNotify";
import { maskPhone } from "@/utils/masks";
import { fieldError } from "@/validation/fields";
import {
  AccountBalanceOutlined,
  ArrowBack,
  ArrowForward,
  BusinessOutlined,
  Check,
  CheckOutlined,
  Close,
  ErrorOutlineOutlined,
  MailOutlineOutlined,
  PhoneOutlined,
  RefreshOutlined,
  SmartphoneOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useCallback, useMemo, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  createCustomer,
  type CustomerCreateRequestDTO,
} from "../api/customers.create.api";
import {
  companyAddressSchema,
  companyContactsSchema,
  companyGeneralSchema,
} from "../schemas";
import type { City } from "../types/City";
import type { AbvtexSealType } from "../types/abvtexSeal";
import { CompanyCreatedModal } from "./CompanyCreatedModal";

type AddCompanyModalProps = {
  open: boolean;
  onClose: () => void;
  /** Cidades disponíveis para o endereço. */
  cities: City[];
};

/** Campos do formulário editados como texto livre. */
type TextFieldKey = Exclude<keyof NewCompanyForm, "abvtexSeal" | "cityId">;

/** Valores do formulário como digitados, em que cidade e selo guardam a opção selecionada. */
type NewCompanyForm = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  abvtexSeal: AbvtexSealType | "";
  phone: string;
  mobile: string;
  email: string;

  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  cityId: number | "";
};

/** Valores iniciais do formulário. */
const defaultForm: NewCompanyForm = {
  fantasyName: "",
  legalName: "",
  cnpj: "",
  abvtexSeal: "NAO_POSSUI",
  phone: "",
  mobile: "",
  email: "",

  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  cityId: "",
};

/** Ícone de status de uma consulta automática (CNPJ/CEP), exibido no fim do campo. Com onRetry, o erro vira um botão de tentar de novo. */
function LookupStatusIcon({
  isFetching,
  isError,
  isFound,
  onRetry,
}: {
  isFetching: boolean;
  isError: boolean;
  isFound: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <InputAdornment position="end">
      {isFetching ? (
        <CircularProgress size={18} />
      ) : isError && onRetry ? (
        <Tooltip title={t("common.actions.retry")}>
          <IconButton
            size="small"
            aria-label={t("common.actions.retry")}
            onClick={onRetry}
          >
            <RefreshOutlined fontSize="small" color="error" />
          </IconButton>
        </Tooltip>
      ) : isError ? (
        <ErrorOutlineOutlined fontSize="small" color="error" />
      ) : isFound ? (
        <CheckOutlined fontSize="small" color="success" />
      ) : null}
    </InputAdornment>
  );
}

/** Modal de cadastro de empresa em duas etapas, dados e endereço e, ao concluir, abre a modal de próximos passos. */
export function AddCompanyModal({
  open,
  onClose,
  cities,
}: AddCompanyModalProps) {
  /** Hooks. */
  const { t } = useTranslation();
  const notify = useNotify();
  const qc = useQueryClient();

  /** Estados. */
  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState<NewCompanyForm>(defaultForm);
  /** Empresa recém-cadastrada, que abre a modal de próximos passos. */
  const [created, setCreated] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [cnpjStatus, setCnpjStatus] = useState<CnpjLookupStatus>("empty");
  /** Indica que o usuário saiu do campo de CNPJ, o que passa a exibir o erro de CNPJ inválido. Volta a falso ao digitar. */
  const [cnpjBlurred, setCnpjBlurred] = useState(false);
  /** Indica que o erro de CNPJ obrigatório foi sinalizado ao tentar avançar. Some ao digitar e só volta em uma nova tentativa. */
  const [cnpjRequiredFlagged, setCnpjRequiredFlagged] = useState(false);
  /** Indica que o usuário tentou avançar do primeiro passo, o que passa a exibir os erros de campos obrigatórios. */
  const [step1Attempted, setStep1Attempted] = useState(false);
  /** Indica que o usuário tentou concluir o cadastro, o que passa a exibir os erros de campos obrigatórios do endereço. */
  const [step2Attempted, setStep2Attempted] = useState(false);
  /** CNPJ recusado pelo backend por já estar cadastrado. O erro some quando o CNPJ é alterado. */
  const [duplicateCnpj, setDuplicateCnpj] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  /** Os demais campos só são liberados depois que a consulta do CNPJ termina, com o CNPJ encontrado ou não. */
  const detailsUnlocked = cnpjStatus === "found" || cnpjStatus === "notFound";

  /** Opções do select de selo ABVTEX, já traduzidas. */
  const abvtexOptions = useMemo(
    () =>
      [
        { value: "NAO_POSSUI" as const, label: t("abvtex.none") },
        { value: "COBRE" as const, label: t("abvtex.copper") },
        { value: "BRONZE" as const, label: t("abvtex.bronze") },
        { value: "PRATA" as const, label: t("abvtex.silver") },
        { value: "OURO" as const, label: t("abvtex.gold") },
      ] satisfies Array<{ value: AbvtexSealType; label: string }>,
    [t],
  );

  /** Limpa o formulário e fecha a modal. */
  const closeAndReset = () => {
    setStep(0);
    setForm(defaultForm);
    setCreated(null);
    setCnpjStatus("empty");
    setCnpjBlurred(false);
    setCnpjRequiredFlagged(false);
    setStep1Attempted(false);
    setStep2Attempted(false);
    setDuplicateCnpj(null);
    setConfirmDiscardOpen(false);
    onClose();
  };

  /** Valores dos campos sem espaços nas pontas, usados na validação e no envio. */
  const cnpj = form.cnpj.trim();
  const phone = form.phone.trim();
  const mobile = form.mobile.trim();
  const email = form.email.trim();
  const zipCode = form.zipCode.trim();

  /** Validação pelos schemas de empresa, que espelham o DTO de criação do backend. */
  const general = companyGeneralSchema.safeParse({
    fantasyName: form.fantasyName,
    legalName: form.legalName,
    cnpj,
  });
  const contacts = companyContactsSchema.safeParse({
    phone,
    mobilePhone: mobile,
    email,
  });
  const address = companyAddressSchema.safeParse({
    street: form.street,
    number: form.number,
    complement: form.complement,
    neighborhood: form.neighborhood,
    zipCode,
    cityId: typeof form.cityId === "number" ? form.cityId : 0,
  });

  /** Erros de formato, exibidos só quando o campo está preenchido, mas inválido. O CNPJ só é sinalizado depois que o usuário sai do campo. */
  const cnpjError =
    cnpjBlurred &&
    cnpj !== "" &&
    (!!fieldError(general, "cnpj") || !isValidCnpj(cnpj));
  const zipError = zipCode !== "" && !!fieldError(address, "zipCode");
  const emailError = email !== "" && !!fieldError(contacts, "email");
  const phoneError = phone !== "" && !!fieldError(contacts, "phone");
  const mobileError = mobile !== "" && !!fieldError(contacts, "mobilePhone");

  /** Erros de campos obrigatórios, sinalizados somente após a tentativa de avançar ou concluir. */
  const cnpjRequiredError = cnpjRequiredFlagged && cnpj === "";
  const cnpjDuplicateError =
    duplicateCnpj !== null && form.cnpj === duplicateCnpj;
  const zipRequiredError = step2Attempted && zipCode === "";
  const streetError = step2Attempted && !!fieldError(address, "street");
  const cityError = step2Attempted && typeof form.cityId !== "number";
  const legalNameError =
    step1Attempted && detailsUnlocked && !!fieldError(general, "legalName");

  /** Cada passo só avança com seus campos válidos. */
  const step1Valid =
    detailsUnlocked &&
    general.success &&
    contacts.success &&
    !cnpjDuplicateError;
  const step2Valid = address.success;

  /** Move o foco para o primeiro campo inválido, para o usuário corrigir sem procurar o erro. */
  const focusFirstInvalid = (candidates: Array<[boolean, string]>) => {
    const id = candidates.find(([invalid]) => invalid)?.[1];
    if (id) document.getElementById(id)?.focus();
  };

  /** Avança para o endereço se o primeiro passo estiver válido, senão, exibe os erros e foca o primeiro campo inválido. */
  const handleNext = () => {
    if (step1Valid) return setStep(1);
    setStep1Attempted(true);
    setCnpjRequiredFlagged(true);
    focusFirstInvalid([
      [
        !detailsUnlocked || !!fieldError(general, "cnpj") || cnpjDuplicateError,
        "company-cnpj",
      ],
      [!!fieldError(general, "legalName"), "company-legalName"],
      [!!fieldError(contacts, "phone"), "company-phone"],
      [!!fieldError(contacts, "mobilePhone"), "company-mobile"],
      [!!fieldError(contacts, "email"), "company-email"],
    ]);
  };

  /** Cadastra a empresa se o endereço estiver válido, senão, exibe os erros e foca o primeiro campo inválido. */
  const handleFinish = () => {
    if (step2Valid) return submit();
    setStep2Attempted(true);
    focusFirstInvalid([
      [!!fieldError(address, "zipCode"), "company-zipCode"],
      [!!fieldError(address, "cityId"), "company-city"],
      [!!fieldError(address, "street"), "company-street"],
    ]);
  };

  /** Atualiza parte do formulário, mantendo os demais campos. */
  const updateForm = (patch: Partial<NewCompanyForm>) =>
    setForm((p) => ({ ...p, ...patch }));

  /** Atualiza um campo de texto do formulário com o valor digitado (já mascarado, se houver máscara). */
  const setField =
    (key: TextFieldKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      updateForm({ [key]: e.target.value });

  /** Texto de ajuda do campo, sendo a mensagem de erro, ou o texto vazio que reserva a linha dela. */
  const helper = (error: boolean, messageKey: string) =>
    error ? t(messageKey) : EMPTY_HELPER_TEXT;

  /** Cadastra a empresa e, em caso de sucesso, abre a modal de próximos passos. */
  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: () => {
      const dto: CustomerCreateRequestDTO = {
        fantasyName: form.fantasyName.trim(),
        legalName: form.legalName.trim(),
        cnpj,
        abvtexSeal: form.abvtexSeal as AbvtexSealType,
        ...(phone ? { phone } : {}),
        ...(mobile ? { mobilePhone: mobile } : {}),
        ...(email ? { email } : {}),
        address: {
          street: form.street.trim(),
          complement: form.complement.trim(),
          neighborhood: form.neighborhood.trim(),
          number: form.number.trim(),
          zipCode,
          cityId: form.cityId as number,
        },
      };
      return createCustomer(dto);
    },
    onSuccess: (customer) => {
      setCreated({ id: customer.id, name: form.legalName.trim() });
      qc.invalidateQueries({ queryKey: qk.customersAll });
      /** O dashboard conta empresas por situação, então precisa ser recarregado. */
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      notify.success("notify.success.companyCreated");
    },
    onError: (e) => {
      /** CNPJ já cadastrado: volta ao primeiro passo e marca o campo, além do aviso. */
      const code = isAxiosError(e)
        ? (e.response?.data as { code?: string } | undefined)?.code
        : undefined;
      if (code === "CNPJ_ALREADY_EXISTS") {
        setDuplicateCnpj(form.cnpj);
        setStep(0);
        requestAnimationFrame(() =>
          document.getElementById("company-cnpj")?.focus(),
        );
      }
      notify.fromError(e);
    },
  });

  /** O formulário tem algo digitado ou preenchido pelas consultas. */
  const isDirty = (Object.keys(defaultForm) as (keyof NewCompanyForm)[]).some(
    (key) => form[key] !== defaultForm[key],
  );

  /** Fecha a modal, pedindo confirmação se há dados preenchidos(não fecha durante o envio). */
  const requestClose = () => {
    if (submitting) return;
    if (isDirty && !created) setConfirmDiscardOpen(true);
    else closeAndReset();
  };

  /** Preenche o endereço com os dados do CEP consultado, mantendo o que já foi digitado nos campos que o CEP não traz. */
  const handleCepFound = useCallback((cepData: ViaCepResponseDTO) => {
    setForm((prev) => ({
      ...prev,
      zipCode: cepData.zipCode,
      street: cepData.street || prev.street,
      complement: cepData.complement || prev.complement,
      neighborhood: cepData.neighborhood || prev.neighborhood,
      cityId: cepData.cityId ? Number(cepData.cityId) : prev.cityId,
    }));
  }, []);

  /** Preenche o formulário com os dados da empresa encontrada na Receita, mantendo o que já foi digitado nos campos que ela não traz. */
  const handleCnpjFound = useCallback((data: ReceitaWsResponseDTO) => {
    const firstPhone = data.phone?.split("/")[0]?.trim();

    setForm((prev) => ({
      ...prev,
      cnpj: data.cnpj || prev.cnpj,
      fantasyName: data.fantasyName || prev.fantasyName,
      legalName: data.legalName || prev.legalName,
      phone: firstPhone ? maskPhone(firstPhone) : prev.phone,
      email: data.email || prev.email,
      street: data.street || prev.street,
      complement: data.complement || prev.complement,
      neighborhood: data.neighborhood || prev.neighborhood,
      number: data.number || prev.number,
      zipCode: data.zipCode || prev.zipCode,
      cityId: data.cityId ? Number(data.cityId) : prev.cityId,
    }));
  }, []);

  /** Consulta o CNPJ na Receita e preenche o formulário com os dados encontrados. */
  const cnpjLookup = useCnpjLookup({
    value: form.cnpj,
    onFound: handleCnpjFound,
    onStatusChange: setCnpjStatus,
  });

  /** Consulta o CEP e preenche o endereço com os dados encontrados. */
  const cepLookup = useCepLookup({
    value: form.zipCode,
    onFound: handleCepFound,
  });

  /** Texto de ajuda do CNPJ, pela ordem de prioridade dos erros possíveis. */
  const cnpjHelperText = cnpjDuplicateError
    ? t("notify.errorCodes.CNPJ_ALREADY_EXISTS")
    : (cnpjLookup.errorMessage ??
      (cnpjRequiredError
        ? t("validation.required")
        : cnpjError
          ? t("validation.cnpjInvalid")
          : cnpj === ""
            ? t("customers.addModal.cnpjFirst")
            : EMPTY_HELPER_TEXT));

  /** Texto de ajuda do CEP, pela ordem de prioridade dos erros possíveis. */
  const zipHelperText =
    cepLookup.errorMessage ??
    (zipRequiredError
      ? t("validation.required")
      : zipError
        ? t("validation.cepInvalid")
        : EMPTY_HELPER_TEXT);

  return (
    <>
      <Modal
        open={open && !created}
        onClose={requestClose}
        maxWidth="md"
        title={t("customers.actions.addCompany")}
        description={t("customers.addModal.description")}
        actions={
          <>
            {step === 0 ? (
              <Button
                tooltip={t("customers.addModal.actions.tooltip.next")}
                variant="text"
                onClick={handleNext}
                data-tour="company.next"
                endIcon={ArrowForward}
                sx={{ color: "primary.main", ml: "auto" }}
              >
                {t("customers.addModal.actions.next")}
              </Button>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  tooltip={t("customers.addModal.actions.tooltip.previous")}
                  variant="text"
                  onClick={() => setStep(0)}
                  startIcon={ArrowBack}
                >
                  {t("customers.addModal.actions.previous")}
                </Button>
                <Button
                  tooltip={t("customers.addModal.actions.tooltip.finish")}
                  disabled={submitting}
                  onClick={handleFinish}
                  data-tour="company.finish"
                  startIcon={!submitting ? Check : undefined}
                >
                  {submitting ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {t("customers.addModal.actions.saving")}
                      <CircularProgress size={18} />
                    </Box>
                  ) : (
                    t("customers.addModal.actions.finish")
                  )}
                </Button>
              </Box>
            )}
          </>
        }
      >
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>{t("customers.addModal.steps.info")}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t("customers.addModal.steps.address")}</StepLabel>
          </Step>
        </Stepper>
        <>
          {/**
           * As duas etapas ficam sempre montadas, só alternando a visibilidade.
           * Desmontar/remontar ao trocar de passo sobrescreveria edições manuais do usuário.
           */}
          <Grid
            container
            columnSpacing={2}
            sx={{ display: step === 0 ? "flex" : "none" }}
          >
            <Grid size={{ xs: 12, md: 6 }} data-tour="company.cnpj">
              <FormField
                required
                id="company-cnpj"
                label={t("customers.addModal.fields.cnpj")}
                mask="cnpj"
                value={form.cnpj}
                onChange={(e) => {
                  setCnpjBlurred(false);
                  setCnpjRequiredFlagged(false);
                  setField("cnpj")(e);
                }}
                onBlur={() => setCnpjBlurred(true)}
                error={
                  cnpjLookup.isError ||
                  cnpjError ||
                  cnpjRequiredError ||
                  cnpjDuplicateError
                }
                helperText={cnpjHelperText}
                startIcon={BusinessOutlined}
                endIcon={
                  <LookupStatusIcon
                    isFetching={cnpjLookup.isFetching}
                    isError={cnpjLookup.isError}
                    isFound={cnpjLookup.status === "found"}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormField
                label={t("customers.addModal.fields.fantasyName")}
                startIcon={StorefrontOutlined}
                placeholder={t(
                  "customers.addModal.fields.placeholder.fantasyName",
                )}
                disabled={!detailsUnlocked}
                value={form.fantasyName}
                onChange={setField("fantasyName")}
                helperText={EMPTY_HELPER_TEXT}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} data-tour="company.legalName">
              <FormField
                required
                id="company-legalName"
                label={t("customers.addModal.fields.legalName")}
                startIcon={AccountBalanceOutlined}
                placeholder={t(
                  "customers.addModal.fields.placeholder.legalName",
                )}
                disabled={!detailsUnlocked}
                value={form.legalName}
                onChange={setField("legalName")}
                error={legalNameError}
                helperText={helper(legalNameError, "validation.required")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormField
                select
                label={t("customers.addModal.fields.abvtexSeal")}
                value={form.abvtexSeal}
                onChange={(e) =>
                  updateForm({
                    abvtexSeal: e.target.value as NewCompanyForm["abvtexSeal"],
                  })
                }
                disabled={!detailsUnlocked}
                helperText={EMPTY_HELPER_TEXT}
              >
                {abvtexOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormField
                mask="phone"
                id="company-phone"
                label={t("customers.addModal.fields.phone")}
                startIcon={PhoneOutlined}
                disabled={!detailsUnlocked}
                value={form.phone}
                onChange={setField("phone")}
                error={phoneError}
                helperText={helper(phoneError, "validation.phoneInvalid")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormField
                mask="mobile"
                id="company-mobile"
                label={t("customers.addModal.fields.mobile")}
                startIcon={SmartphoneOutlined}
                disabled={!detailsUnlocked}
                value={form.mobile}
                onChange={setField("mobile")}
                error={mobileError}
                helperText={helper(mobileError, "validation.mobileInvalid")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormField
                id="company-email"
                label={t("customers.addModal.fields.email")}
                startIcon={MailOutlineOutlined}
                placeholder={t("customers.addModal.fields.placeholder.email")}
                disabled={!detailsUnlocked}
                value={form.email}
                onChange={setField("email")}
                error={emailError}
                helperText={helper(emailError, "validation.emailInvalid")}
              />
            </Grid>
          </Grid>
          <Grid
            container
            columnSpacing={2}
            sx={{ display: step === 1 ? "flex" : "none" }}
          >
            <Grid size={{ xs: 12, md: 6 }} data-tour="company.zipCode">
              <FormField
                required
                mask="cep"
                id="company-zipCode"
                label={t("customers.addModal.fields.zipCode")}
                value={form.zipCode}
                onChange={setField("zipCode")}
                error={cepLookup.isError || zipError || zipRequiredError}
                helperText={zipHelperText}
                endIcon={
                  <LookupStatusIcon
                    isFetching={cepLookup.isFetching}
                    isError={cepLookup.isError}
                    isFound={cepLookup.isSuccess}
                    onRetry={
                      cepLookup.isUnavailable ? cepLookup.retry : undefined
                    }
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormField
                select
                required
                id="company-city"
                label={t("customers.addModal.fields.city")}
                emptyOptionLabel={t(
                  "customers.addModal.fields.placeholder.city",
                )}
                value={form.cityId}
                onChange={(e) =>
                  updateForm({
                    cityId: e.target.value ? Number(e.target.value) : "",
                  })
                }
                error={cityError}
                helperText={helper(cityError, "validation.required")}
              >
                {cities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <FormField
                required
                id="company-street"
                label={t("customers.addModal.fields.street")}
                placeholder={t("customers.addModal.fields.placeholder.street")}
                value={form.street}
                onChange={setField("street")}
                error={streetError}
                helperText={helper(streetError, "validation.required")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormField
                label={t("customers.addModal.fields.number")}
                placeholder={t("customers.addModal.fields.placeholder.number")}
                value={form.number}
                onChange={setField("number")}
                helperText={EMPTY_HELPER_TEXT}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <FormField
                label={t("customers.addModal.fields.complement")}
                placeholder={t(
                  "customers.addModal.fields.placeholder.complement",
                )}
                value={form.complement}
                onChange={setField("complement")}
                helperText={EMPTY_HELPER_TEXT}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormField
                label={t("customers.addModal.fields.neighborhood")}
                placeholder={t(
                  "customers.addModal.fields.placeholder.neighborhood",
                )}
                value={form.neighborhood}
                onChange={setField("neighborhood")}
                helperText={EMPTY_HELPER_TEXT}
              />
            </Grid>
          </Grid>
        </>
      </Modal>
      {/** Modal exibido após a criação de uma nova empresa. */}
      <CompanyCreatedModal
        open={open && !!created}
        companyId={created?.id ?? null}
        companyName={created?.name ?? ""}
        onClose={closeAndReset}
      />
      {/** Confirma o descarte dos dados preenchidos ao fechar o formulário. */}
      <ConfirmModal
        open={confirmDiscardOpen}
        title={t("unsavedChanges.title")}
        message={t("unsavedChanges.message")}
        actions={[
          {
            label: t("unsavedChanges.stay"),
            tooltip: t("customers.addModal.discard.tooltip.stay"),
            onClick: () => setConfirmDiscardOpen(false),
            startIcon: ArrowBack,
          },
          {
            label: t("unsavedChanges.leave"),
            tooltip: t("customers.addModal.discard.tooltip.leave"),
            color: "error",
            startIcon: Close,
            onClick: closeAndReset,
          },
        ]}
      />
    </>
  );
}
