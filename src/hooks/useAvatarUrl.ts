import { qk } from "@/api/keys";
import { getAvatarBlob } from "@/features/users/api/user.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Devolve uma URL exibível da foto de perfil do usuário informado.
 *
 * O download fica no cache do React Query como Blob, de modo que os vários
 * componentes que mostram o mesmo avatar (menu do topo e tela de perfil, por
 * exemplo) compartilhem uma única requisição — antes cada um baixava a imagem
 * inteira por conta própria, fora do cache.
 *
 * A object URL é criada por componente e revogada ao desmontar. É por isso que o
 * cache guarda o Blob, e não a URL: uma URL compartilhada seria revogada pelo
 * primeiro componente a desmontar, quebrando a imagem nos demais.
 *
 * @param userId       usuário dono da foto
 * @param hasAvatar    indica que existe foto cadastrada; evita chamar a API à toa
 */
export function useAvatarUrl(userId?: number, hasAvatar?: boolean | string | null) {
  const { data: blob } = useQuery({
    queryKey: qk.avatar(userId ?? 0),
    queryFn: () => getAvatarBlob(userId as number),
    enabled: !!userId && !!hasAvatar,
  });

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return url;
}
