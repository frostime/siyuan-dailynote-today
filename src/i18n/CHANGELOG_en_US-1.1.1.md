## Daily Note Todahy v1.1.1 Update


This minor version update mainly optimizes the experience of reservation block and supports more date templates.

### Feature
- New date template: use "." as separator, such as 2023.12.23
- New date template: N days later, such as 28 days later, notice that only Arabic numerals are supported
- Provided a button to prune invalid reservation blocks in the top toolbar icon menu

### Fix

- Optimized the matching template of standard year, month, and day to reduce the probability of mis-matching
- If there are no reservation blocks found, a warning window will pop up instead of inserting.
- To mitigate the issue of the official API swallowing the theme's custom menu, Alt + Right-click has been provided as a transitional solution. Please refer to the README documentation for more details.
