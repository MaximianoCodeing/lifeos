"""
Camada de IA do LifeOS. Centraliza todos os prompts e chamadas ao modelo,
para que os routers nunca falem diretamente com o provedor de IA.

Se ANTHROPIC_API_KEY não estiver definida, funciona em modo "mock" —
devolve respostas plausíveis para que o resto da aplicação continue
funcional em desenvolvimento sem custos de API.
"""
import os

try:
    import anthropic
    _client = anthropic.Anthropic() if os.getenv("ANTHROPIC_API_KEY") else None
except ImportError:
    _client = None


class AIService:
    def _complete(self, system: str, user_message: str, max_tokens: int = 500) -> str:
        if _client is None:
            return "[IA em modo simulado — configura ANTHROPIC_API_KEY para respostas reais.]"
        response = _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_message}],
        )
        return "".join(block.text for block in response.content if block.type == "text")

    def summarize_journal(self, text: str, mood, energy, productivity) -> str:
        prompt = f"Humor: {mood}/5, Energia: {energy}/5, Produtividade: {productivity}/5.\n\nTexto do diário:\n{text}"
        return self._complete(
            "Resume esta entrada de diário pessoal em 2-3 frases, em português, com empatia e sem julgamentos.",
            prompt, max_tokens=200,
        )

    def summarize_document(self, text: str) -> str:
        return self._complete(
            "Resume o seguinte documento em português, de forma clara e objetiva, em no máximo 5 frases.",
            text[:8000], max_tokens=400,
        )

    def answer_question(self, question: str, context: str = "") -> str:
        system = "És o assistente pessoal do LifeOS. Respondes de forma direta, útil e em português."
        prompt = f"Contexto do utilizador:\n{context}\n\nPergunta: {question}" if context else question
        return self._complete(system, prompt, max_tokens=600)

    def generate_plan(self, goal_description: str) -> str:
        return self._complete(
            "Cria um plano de ação passo-a-passo, em português, para atingir o objetivo indicado. "
            "Usa uma lista numerada curta.",
            goal_description, max_tokens=400,
        )

    def generate_flashcards(self, source_text: str, count: int = 10) -> str:
        return self._complete(
            f"Gera {count} flashcards (pergunta/resposta) em português a partir do texto fornecido. "
            "Devolve APENAS JSON: [{{\"front\": ..., \"back\": ...}}].",
            source_text[:8000], max_tokens=1200,
        )

    def generate_checklist(self, task_description: str) -> str:
        return self._complete(
            "Divide esta tarefa numa checklist de passos concretos, em português. Devolve uma lista curta.",
            task_description, max_tokens=300,
        )


ai_service = AIService()
