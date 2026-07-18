"""Importação de Excel/CSV — rotina do utilizador e flashcards."""
import io
import pandas as pd

TASK_LIKE_COLUMNS = {"tarefa", "task", "titulo", "título", "atividade"}
DATE_COLUMNS = {"data", "date", "dia"}
TIME_COLUMNS = {"hora", "time"}
FLASHCARD_FRONT_COLUMNS = {"frente", "front", "palavra", "pergunta", "termo"}
FLASHCARD_BACK_COLUMNS = {"verso", "back", "tradução", "traducao", "resposta", "significado"}


def read_table(filename: str, content: bytes) -> pd.DataFrame:
    if filename.lower().endswith(".csv"):
        return pd.read_csv(io.BytesIO(content))
    return pd.read_excel(io.BytesIO(content))


def parse_routine(df: pd.DataFrame) -> list[dict]:
    """
    Reconhece automaticamente colunas de uma rotina em Excel/CSV e devolve
    uma lista de eventos/tarefas prontos a criar — sem configuração manual.
    """
    cols_lower = {c.lower().strip(): c for c in df.columns}
    title_col = next((cols_lower[c] for c in TASK_LIKE_COLUMNS if c in cols_lower), df.columns[0])
    date_col = next((cols_lower[c] for c in DATE_COLUMNS if c in cols_lower), None)
    time_col = next((cols_lower[c] for c in TIME_COLUMNS if c in cols_lower), None)

    items = []
    for _, row in df.iterrows():
        title = str(row[title_col]).strip()
        if not title or title.lower() == "nan":
            continue
        items.append({
            "title": title,
            "date": str(row[date_col]) if date_col and pd.notna(row[date_col]) else None,
            "time": str(row[time_col]) if time_col and pd.notna(row[time_col]) else None,
        })
    return items


def parse_flashcards(df: pd.DataFrame) -> tuple[list[dict], bool]:
    """
    Deteta colunas de flashcards automaticamente. Se só existir uma coluna
    (palavras), devolve needs_generation=True para o frontend perguntar
    se quer gerar tradução/definição/exemplo via IA.
    """
    cols_lower = {c.lower().strip(): c for c in df.columns}
    front_col = next((cols_lower[c] for c in FLASHCARD_FRONT_COLUMNS if c in cols_lower), df.columns[0])
    back_col = next((cols_lower[c] for c in FLASHCARD_BACK_COLUMNS if c in cols_lower), None)

    if back_col is None:
        words = [str(w).strip() for w in df[front_col].dropna().tolist()]
        return [{"front": w, "back": ""} for w in words], True

    cards = []
    for _, row in df.iterrows():
        front = str(row[front_col]).strip()
        back = str(row[back_col]).strip() if pd.notna(row[back_col]) else ""
        if front and front.lower() != "nan":
            cards.append({"front": front, "back": back})
    return cards, False
