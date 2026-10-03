# Manual reservation date selection

## Goal

Allow users to opt out of automatic date recognition when reserving a block.

## Requirements

- Add an `AutoMatchReservationDate` setting that defaults to enabled for backward compatibility.
- When disabled, skip all block-text date parsing and show a manual date picker.
- Keep `PopupReserveDialog` enabled while automatic recognition is disabled so a reservation cannot be created without a user-selected date.

## Verification

- Type-check and build the plugin.
- With recognition disabled, reserve text such as `打算国庆6-7号去考D证` and select a future date manually.
