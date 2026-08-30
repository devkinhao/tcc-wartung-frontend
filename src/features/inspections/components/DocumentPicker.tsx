import { useRef } from "react";
import { Box, Button, Chip } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useTranslation } from "react-i18next";

import { formatFileSizeKB } from "@/utils/date";

type Props = {
  /** Arquivos escolhidos (ainda não enviados). */
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

/**
 * Seletor de múltiplos arquivos para anexar a uma inspeção. Não pede descrição —
 * o nome do arquivo já identifica o documento. Os escolhidos aparecem como
 * chips lado a lado. O envio fica a cargo do consumidor.
 */
export function DocumentPicker({ files, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (selected: FileList | null) => {
    if (!selected) return;

    const merged = [...files];
    for (const file of Array.from(selected)) {
      const alreadyAdded = merged.some((f) => f.name === file.name && f.size === file.size);
      if (!alreadyAdded) merged.push(file);
    }

    onChange(merged);
    if (inputRef.current) inputRef.current.value = ""; // permite re-selecionar o mesmo arquivo
  };

  const removeAt = (index: number) => onChange(files.filter((_, i) => i !== index));

  return (
    <Box>
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />

      <Button
        variant="outlined"
        size="small"
        startIcon={<AttachFileIcon />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {t("inspectionDetails.documents.picker.select")}
      </Button>

      {files.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
          {files.map((file, index) => (
            <Chip
              key={`${file.name}-${file.size}-${index}`}
              icon={<DescriptionOutlinedIcon />}
              label={`${file.name} · ${formatFileSizeKB(file.size)}`}
              title={file.name}
              onDelete={() => removeAt(index)}
              disabled={disabled}
              variant="outlined"
              sx={{ maxWidth: 240 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
