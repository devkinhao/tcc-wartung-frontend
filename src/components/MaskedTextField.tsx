import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import { applyMask, MASK_PLACEHOLDERS, type MaskType } from "@/utils/masks";

type Props = Omit<TextFieldProps, "onChange"> & {
  /** Tipo de máscara a aplicar */
  mask: MaskType;
  /** Valor atual (já mascarado) */
  value: string;
  /** Recebe o novo valor mascarado pronto para armazenar no estado */
  onChange: (maskedValue: string) => void;
};

/**
 * TextField com máscara progressiva.
 *
 * O valor armazenado e enviado ao backend é sempre a string formatada
 * (ex: "12.345.678/0001-90") — compatível com os patterns de validação
 * do backend (CNPJ, CPF etc.).
 *
 * Uso:
 * ```tsx
 * <MaskedTextField
 *   mask="cnpj"
 *   value={form.cnpj}
 *   onChange={(v) => setForm(p => ({ ...p, cnpj: v }))}
 *   label="CNPJ"
 * />
 * ```
 */
export const MaskedTextField = forwardRef<HTMLDivElement, Props>(
  ({ mask, value, onChange, placeholder, slotProps, ...rest }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange(applyMask(e.target.value, mask));
    }

    return (
      <TextField
        ref={ref}
        {...rest}
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? MASK_PLACEHOLDERS[mask]}
        slotProps={{ ...slotProps, htmlInput: { inputMode: "numeric" } }}
      />
    );
  },
);

MaskedTextField.displayName = "MaskedTextField";
