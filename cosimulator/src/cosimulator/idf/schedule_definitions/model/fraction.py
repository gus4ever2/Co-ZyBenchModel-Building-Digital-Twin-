"""Define the fraction schedule type limits."""

from pydantic import BaseModel


class Fraction(BaseModel):
    Name: str = "Fraction"  # Shared IDF name used by schedules requiring fractions.
    Lower_Limit_Value: float = 0.0  # Smallest allowed schedule value.
    Upper_Limit_Value: float = 1.0  # Largest allowed schedule value.
    Numeric_Type: str = "Continuous"  # Fraction schedules may contain non-integer values.
