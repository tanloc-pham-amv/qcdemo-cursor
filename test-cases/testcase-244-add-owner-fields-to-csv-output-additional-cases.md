No.244 Add the owner code and the owner estimation amount to the CSV output - Additional cases

## Object
CSV export output (CSV出力 / CSV output)

## Overview
This companion test case adds detailed verification scenarios for the owner-related CSV columns introduced by No.244, based on the field-level checklist and source-selection logic.

## Required change
Verify the CSV output for the following owner-related fields in more detail:
1. **家主コード / Owner code**
   - Source: `leaving_basics.current_owner_code`
2. **家主見積承諾日 / Owner estimation approval date**
   - Source: `leaving_checks.estimate_approval_datetime`
   - Format: `YYYY/MM/DD`
3. **家主見積金額 / Owner estimation amount**
   - When **家主見積書 / owner estimation PDF** is `NULL` or empty:
     - Source: `leaving_checks.estimate_amount_from_amb`
   - When **家主見積書 / owner estimation PDF** exists:
     - Source: `leaving_owner_estimates.total_amount`
4. **見積交渉メモ / Estimate negotiation memo**
   - Source: `leaving_checks.estimate_negotiation_memo`
   - Format: multi-line text stored safely in CSV

## Goal
Ensure the new owner-related CSV fields are exported with the correct source priority, exact schema placement, and valid CSV formatting for special characters and multi-line content.

## Test Steps & Expected Results

### TC-1: New owner-related columns are placed in the correct schema order
**Preconditions**
- User can access the target screen that provides CSV export.
- CSV export returns at least one row.

**Steps**
1. Open the target screen.
2. Execute a search that returns exportable data.
3. Run CSV export.
4. Open the generated CSV file.
5. Check the header sequence around the owner-related columns.

**Expected**
1. The CSV contains these columns in this order:
   - **家主コード / Owner code**
   - **家主名 / Owner name**
   - **家主見積承諾日 / Owner estimation approval date**
   - **家主見積金額 / Owner estimation amount**
   - **見積交渉メモ / Estimate negotiation memo**
   - **家主請求金額 / Owner billing amount**
2. The new columns are inserted in the expected position and do not break the existing schema.

### TC-2: Owner code is exported from leaving_basics.current_owner_code
**Preconditions**
- A test record exists with a known value in `leaving_basics.current_owner_code`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主コード / Owner code** value.

**Expected**
1. The CSV value exactly matches `leaving_basics.current_owner_code`.
2. The value is displayed in the correct row and correct column.

### TC-3: Owner estimation approval date is exported from leaving_checks.estimate_approval_datetime
**Preconditions**
- A test record exists with a known non-empty value in `leaving_checks.estimate_approval_datetime`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積承諾日 / Owner estimation approval date** value.

**Expected**
1. The CSV value matches `leaving_checks.estimate_approval_datetime`.
2. The displayed value uses the exact format `YYYY/MM/DD`.
3. Time information is not included in the exported value.

### TC-4: Owner estimation amount uses AMB estimate amount when owner estimation PDF is NULL
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` is `NULL`.
- The same record has a known value in `leaving_checks.estimate_amount_from_amb`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積金額 / Owner estimation amount** value.

**Expected**
1. The CSV value matches `leaving_checks.estimate_amount_from_amb`.
2. The export does not incorrectly use `leaving_owner_estimates.total_amount` for this record.

### TC-5: Owner estimation amount uses AMB estimate amount when owner estimation PDF is an empty string
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` is an empty string.
- The same record has a known value in `leaving_checks.estimate_amount_from_amb`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積金額 / Owner estimation amount** value.

**Expected**
1. The CSV value matches `leaving_checks.estimate_amount_from_amb`.
2. Empty-string PDF data is treated the same as missing PDF data for source selection.

### TC-6: Owner estimation amount uses leaving_owner_estimates.total_amount when owner estimation PDF exists
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` has a stored file value.
- The same record has a known value in `leaving_owner_estimates.total_amount`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積金額 / Owner estimation amount** value.

**Expected**
1. The CSV value matches `leaving_owner_estimates.total_amount`.
2. The export does not incorrectly use `leaving_checks.estimate_amount_from_amb` for this record.

### TC-7: Estimate negotiation memo is exported from leaving_checks.estimate_negotiation_memo
**Preconditions**
- A test record exists with a known value in `leaving_checks.estimate_negotiation_memo`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **見積交渉メモ / Estimate negotiation memo** value.

**Expected**
1. The CSV value exactly matches `leaving_checks.estimate_negotiation_memo`.
2. The memo is exported in the correct row and correct column.

### TC-8: Estimate negotiation memo preserves CSV validity when it contains commas, double quotes, and line breaks
**Preconditions**
- A test record exists with **見積交渉メモ / Estimate negotiation memo** containing:
  - commas
  - double quotes
  - multiple lines

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the CSV in a raw text editor and also in a CSV-aware tool.
5. Inspect the row for the known record.

**Expected**
1. The memo content is preserved without truncation.
2. The memo cell is escaped/quoted correctly for CSV.
3. The row is not split into extra rows because of line breaks in the memo.
4. Neighboring columns remain aligned correctly after import into a CSV-aware tool.

### TC-9: Empty owner estimation approval date is exported as an empty value
**Preconditions**
- A test record exists where `leaving_checks.estimate_approval_datetime` is empty or `NULL`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積承諾日 / Owner estimation approval date** value.

**Expected**
1. The CSV field is empty.
2. The export does not output invalid placeholders such as `NULL`, `null`, `undefined`, or zero-date text.

### TC-10: Empty owner estimation amount is exported as an empty value when both candidate sources are empty
**Preconditions**
- A test record exists where both of these values are empty or `NULL`:
  - `leaving_checks.estimate_amount_from_amb`
  - `leaving_owner_estimates.total_amount`

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the **家主見積金額 / Owner estimation amount** value.

**Expected**
1. The CSV field is empty.
2. The export does not output an incorrect fallback value.

### TC-11: Owner-related values remain aligned when exporting multiple records with different source patterns
**Preconditions**
- At least three records exist with different combinations of owner-related data:
  - Record A: owner estimation PDF is `NULL`
  - Record B: owner estimation PDF exists
  - Record C: owner-related fields are partially empty

**Steps**
1. Open the target screen.
2. Filter the data so all three known records are included.
3. Execute CSV export.
4. Open the generated CSV.
5. Compare the owner-related columns in each row with the source data.

**Expected**
1. Record A shows the correct fallback amount from `leaving_checks.estimate_amount_from_amb`.
2. Record B shows the correct amount from `leaving_owner_estimates.total_amount`.
3. Record C shows the correct mix of populated and empty values.
4. No owner-related value is shifted into another record's row.

### TC-12: Existing adjacent columns remain correct after the new owner-related columns are added
**Preconditions**
- User can export CSV data for at least one known record.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and inspect the columns before and after the new owner-related fields.
5. Compare the data with the pre-existing source values.

**Expected**
1. **家主名 / Owner name** remains correct.
2. **家主請求金額 / Owner billing amount** remains correct.
3. **業者名 / Trader name** remains correct.
4. Adding the new columns does not shift or corrupt adjacent existing columns.

## Notes
- Use known records that explicitly cover the source-selection rule for **家主見積金額 / Owner estimation amount**.
- When validating memo escaping, inspect both the raw CSV text and the parsed spreadsheet view.
- If the system specification defines a separate display format for amount fields, validate that the exported value follows that exact rule consistently for both amount sources.
