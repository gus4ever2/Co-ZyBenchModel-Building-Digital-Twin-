from cosimulator.schemas.simulation_context import WindowOpeningStrategy


# A wider thermostat gap means the control is not in an active conditioning
# state, so an opening decision based on those setpoints is not meaningful.
MAX_ACTIVE_SETPOINT_GAP_C = 4.0


def calculate_linear_temperature_factor(
    *,
    temperature_c: float,
    heating_setpoint_c: float,
    cooling_setpoint_c: float,
    temperature_margin_c: float,
) -> float:
    """Return a gradual opening factor around the thermostat deadband."""
    if heating_setpoint_c <= temperature_c <= cooling_setpoint_c:
        return 1.0

    if temperature_margin_c == 0:
        return 0.0

    # The margin extends the allowed range on both sides of the deadband.
    lower_temperature_limit_c = (
        heating_setpoint_c - temperature_margin_c
    )
    upper_temperature_limit_c = (
        cooling_setpoint_c + temperature_margin_c
    )

    if lower_temperature_limit_c < temperature_c < heating_setpoint_c:
        return (
            temperature_c - lower_temperature_limit_c
        ) / temperature_margin_c

    if cooling_setpoint_c < temperature_c < upper_temperature_limit_c:
        return (
            upper_temperature_limit_c - temperature_c
        ) / temperature_margin_c

    return 0.0


def calculate_on_off_temperature_factor(
    *,
    temperature_c: float,
    heating_setpoint_c: float,
    cooling_setpoint_c: float,
    temperature_margin_c: float,
) -> float:
    """Return full opening inside the permitted range, otherwise zero."""
    # On/off control uses the same range but never returns an intermediate value.
    lower_temperature_limit_c = (
        heating_setpoint_c - temperature_margin_c
    )
    upper_temperature_limit_c = (
        cooling_setpoint_c + temperature_margin_c
    )

    if lower_temperature_limit_c <= temperature_c <= upper_temperature_limit_c:
        return 1.0

    return 0.0


def calculate_temperature_suitability_factor(
    *,
    temperature_c: float,
    heating_setpoint_c: float,
    cooling_setpoint_c: float,
    temperature_margin_c: float,
    opening_strategy: WindowOpeningStrategy,
) -> float:
    """Apply the selected window-opening strategy."""
    # Reject malformed thermostat data instead of opening a window incorrectly.
    if heating_setpoint_c > cooling_setpoint_c:
        return 0.0

    if (
        cooling_setpoint_c - heating_setpoint_c
        > MAX_ACTIVE_SETPOINT_GAP_C
    ):
        return 0.0

    if opening_strategy in (WindowOpeningStrategy.ON_OFF, WindowOpeningStrategy.FIXED_PERCENTAGE):
        return calculate_on_off_temperature_factor(
            temperature_c=temperature_c,
            heating_setpoint_c=heating_setpoint_c,
            cooling_setpoint_c=cooling_setpoint_c,
            temperature_margin_c=temperature_margin_c,
        )

    return calculate_linear_temperature_factor(
        temperature_c=temperature_c,
        heating_setpoint_c=heating_setpoint_c,
        cooling_setpoint_c=cooling_setpoint_c,
        temperature_margin_c=temperature_margin_c,
    )
