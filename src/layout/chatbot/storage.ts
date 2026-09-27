/**
 * Chaves do assistente no localStorage.
 *
 * Ficam aqui, e não junto de quem as usa, porque o logout precisa apagá-las
 * (ver AuthProvider): são dados por usuário — a conversa e quais tutoriais ele já
 * fez — e sem isso vazariam para o próximo login na mesma máquina. Manter a chave
 * literal em dois arquivos foi exatamente o que deixou a limpeza apontando para
 * uma chave que não existe mais.
 */
export const CHAT_CONVERSATION_KEY = "chatbot:conversation:v2";
export const TOUR_COMPLETED_KEY = "tour:completed:v1";

export const ASSISTANT_STORAGE_KEYS = [CHAT_CONVERSATION_KEY, TOUR_COMPLETED_KEY] as const;
