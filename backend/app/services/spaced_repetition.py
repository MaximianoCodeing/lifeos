from datetime import date, timedelta


def review_card(ease_factor: float, interval_days: int, repetitions: int, quality: int):
    if quality < 3:
        repetitions = 0
        interval_days = 1
    else:
        repetitions += 1
        if repetitions == 1:
            interval_days = 1
        elif repetitions == 2:
            interval_days = 6
        else:
            interval_days = round(interval_days * ease_factor)

    ease_factor = max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    next_review = date.today() + timedelta(days=interval_days)
    return ease_factor, interval_days, repetitions, next_review
