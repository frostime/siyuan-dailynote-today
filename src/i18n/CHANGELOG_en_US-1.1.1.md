## v1.1.1.patch

This is a temporary patch update, to satisfy the API change in SiYuan 2.8.10

In addition, a SQL template has been updated in the README document, which can quickly query all reservation created after v1.1.1.

## Daily Note Todahy v1.1.1 Update


This minor version update mainly optimizes the experience of reservation block and supports more date templates.

### Feature
- New date template: use "." as separator, such as 2023.12.23
- New date template: N days later, such as 28 days later, notice that only Arabic numerals are supported
- Provided a button to prune invalid reservation blocks in the top toolbar icon menu
- After completing the reservation block, a custom attribute `custom-reservation` will be automatically added to the block and memo will be filled in, making it easier for users to identify which blocks have been booked.
    - You can customize the CSS styles to display these reservation blocks, an example css is provided in README document.

### Fix

- Optimized the matching template of standard year, month, and day to reduce the probability of mis-matching
- If there are no reservation blocks found, a warning window will pop up instead of inserting.
- To mitigate the issue of the official API swallowing the theme's custom menu, Alt + Right-click has been provided as a transitional solution. Please refer to the README documentation for more details.
