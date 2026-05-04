No.244 Add the owner code and the owner estimation amount to the CSV output

## Object
CSV export output (CSV出力 / CSV output)

## Overview
The CSV export must include additional owner-related columns sourced from the owner information group and the estimate-for-owner group. The export also needs to follow the source-selection rule for owner estimation amount and keep valid CSV formatting for multi-line memo content.

## Required change
Add and verify the following fields in the CSV output:
1. **家主コード / Owner code**
   - Source: **家主情報グループ / Owner info group**
   - DB mapping: `leaving_basics.current_owner_code`
2. **家主見積承諾日 / Owner estimation approval date**
   - Source: **オーナーへの見積グループ / Estimate group for the owner**
   - DB mapping: `leaving_checks.estimate_approval_datetime`
   - Format: `YYYY/MM/DD`
3. **家主見積金額 / Owner estimation amount**
   - Source: **オーナーへの見積グループ / Estimate group for the owner**
   - When **家主見積書 / owner estimation PDF** is `NULL` or empty:
     - Use `leaving_checks.estimate_amount_from_amb`
   - When **家主見積書 / owner estimation PDF** exists:
     - Use `leaving_owner_estimates.total_amount`
   - Format: amount value as exported by the CSV
4. **見積交渉メモ / Estimate negotiation memo**
   - Source: **オーナーへの見積グループ / Estimate group for the owner**
   - DB mapping: `leaving_checks.estimate_negotiation_memo`
   - Format: multi-line text

## Goal
When a user performs CSV export, the generated file includes the four owner-related columns with the correct values, schema order, source priority, and CSV formatting rules.

## Test Steps & Expected Results

### TC-1: CSV export includes the new owner-related columns in the header and correct schema order
**Preconditions**
- User can access the target screen that provides CSV export.
- Test data exists for at least one record that has owner information and estimate-for-owner information.

**Steps**
1. Open the target screen.
2. Search or filter so that the known test record is included in the export target.
3. Execute CSV export.
4. Open the generated CSV file.
5. Check the header row and the surrounding column order.

**Expected**
1. The CSV header contains the following columns:
   - **家主コード / Owner code**
   - **家主見積承諾日 / Owner estimation approval date**
   - **家主見積金額 / Owner estimation amount**
   - **見積交渉メモ / Estimate negotiation memo**
2. The CSV contains these columns in the expected schema order around the owner-related area:
   - **家主コード / Owner code**
   - **家主名 / Owner name**
   - **家主見積承諾日 / Owner estimation approval date**
   - **家主見積金額 / Owner estimation amount**
   - **見積交渉メモ / Estimate negotiation memo**
   - **家主請求金額 / Owner billing amount**
3. Existing columns are still present and unchanged.

### TC-2: Owner code is exported from the owner info group
**Preconditions**
- A test record exists with a known **家主コード / Owner code** in the **家主情報グループ / Owner info group**.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Check the value in the **家主コード / Owner code** column.

**Expected**
1. The exported **家主コード / Owner code** exactly matches the value stored in the **家主情報グループ / Owner info group**.
2. The value matches `leaving_basics.current_owner_code`.
3. The value is exported in the correct row for the target record.

### TC-3: Owner estimation approval date is exported in YYYY/MM/DD format
**Preconditions**
- A test record exists with a known **家主見積承諾日 / Owner estimation approval date**.
- The source value is not empty.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Check the value in the **家主見積承諾日 / Owner estimation approval date** column.

**Expected**
1. The exported value matches the source date for the record.
2. The exported value matches `leaving_checks.estimate_approval_datetime`.
3. The date format is exactly `YYYY/MM/DD`.
4. The exported value does not contain time information.

### TC-4: Owner estimation amount uses AMB estimate amount when owner estimation PDF is NULL
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` is `NULL`.
- The same record has a known value in `leaving_checks.estimate_amount_from_amb`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the value in the **家主見積金額 / Owner estimation amount** column.

**Expected**
1. The exported **家主見積金額 / Owner estimation amount** matches `leaving_checks.estimate_amount_from_amb`.
2. The export does not incorrectly use `leaving_owner_estimates.total_amount` for this record.
3. The value is exported as an amount field in the format defined by the CSV output.

### TC-5: Owner estimation amount uses AMB estimate amount when owner estimation PDF is an empty string
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` is an empty string.
- The same record has a known value in `leaving_checks.estimate_amount_from_amb`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the value in the **家主見積金額 / Owner estimation amount** column.

**Expected**
1. The exported **家主見積金額 / Owner estimation amount** matches `leaving_checks.estimate_amount_from_amb`.
2. Empty-string PDF data is treated the same as missing PDF data for source selection.
3. The value is exported as an amount field in the format defined by the CSV output.

### TC-6: Owner estimation amount uses leaving_owner_estimates.total_amount when owner estimation PDF exists
**Preconditions**
- A test record exists where `leaving_owner_estimates.owner_estimation_pdf` has a stored file value.
- The same record has a known value in `leaving_owner_estimates.total_amount`.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and locate the row for the known record.
5. Check the value in the **家主見積金額 / Owner estimation amount** column.

**Expected**
1. The exported **家主見積金額 / Owner estimation amount** matches `leaving_owner_estimates.total_amount`.
2. The export does not incorrectly use `leaving_checks.estimate_amount_from_amb` for this record.
3. The value is exported as an amount field in the format defined by the CSV output.

### TC-7: Estimate negotiation memo is exported correctly
**Preconditions**
- A test record exists with a known **見積交渉メモ / Estimate negotiation memo** value in the **オーナーへの見積グループ / Estimate group for the owner**.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Check the value in the **見積交渉メモ / Estimate negotiation memo** column.

**Expected**
1. The exported memo matches the source text content.
2. The exported value matches `leaving_checks.estimate_negotiation_memo`.
3. The memo is exported in the correct row and correct column.

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
2. The memo cell is escaped or quoted correctly for CSV.
3. The row is not split into extra rows because of line breaks in the memo.
4. Neighboring columns remain aligned correctly after import into a CSV-aware tool.

### TC-9: Empty owner-related fields are exported as empty values
**Preconditions**
- A test record exists where the following fields are empty:
  - **家主コード / Owner code**
  - **家主見積承諾日 / Owner estimation approval date**
  - **家主見積金額 / Owner estimation amount**
  - **見積交渉メモ / Estimate negotiation memo**

**Steps**
1. Open the target screen.
2. Filter the data so the known record with empty values is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Check each new owner-related column.

**Expected**
1. Each of the four new columns is present in the header.
2. Each of the four new columns is exported as an empty value for the record.
3. No placeholder text such as `null`, `NULL`, `undefined`, zero-date text, or invalid default values is output.

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
5. Check the value in the **家主見積金額 / Owner estimation amount** column.

**Expected**
1. The CSV field is empty.
2. The export does not output an incorrect fallback value.

### TC-11: Export handles a mix of populated and empty owner fields correctly
**Preconditions**
- A test record exists where some of the new owner-related fields are populated and others are empty.

**Steps**
1. Open the target screen.
2. Filter the data so the mixed-value record is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Compare the four owner-related columns with the source data.

**Expected**
1. Populated fields are exported with the correct values.
2. Empty fields remain empty.
3. The presence of empty values in one field does not affect the export of the other owner-related fields.

### TC-12: Multiple exported rows each show the correct owner-related values
**Preconditions**
- At least two exportable records exist with different owner-related values.

**Steps**
1. Open the target screen.
2. Filter the data so multiple known records are included.
3. Execute CSV export.
4. Open the generated CSV.
5. Compare the owner-related columns for each exported row against the source data.

**Expected**
1. Each exported row shows the correct **家主コード / Owner code** for that record.
2. Each exported row shows the correct **家主見積承諾日 / Owner estimation approval date** in `YYYY/MM/DD` format for that record.
3. Each exported row shows the correct **家主見積金額 / Owner estimation amount** for that record.
4. Each exported row shows the correct **見積交渉メモ / Estimate negotiation memo** for that record.
5. Values from one record are not shifted into another record's row.

### TC-13: Owner-related values remain aligned when exporting multiple records with different source patterns
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

### TC-14: Existing adjacent columns remain correct after the new owner-related columns are added
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
- Validate the CSV using a raw text editor or CSV-aware tool when checking multi-line memo behavior.
- Use known records that explicitly cover the source-selection rule for **家主見積金額 / Owner estimation amount**.
- When validating memo escaping, inspect both the raw CSV text and the parsed spreadsheet view.
- If the product defines a strict column order for CSV output, confirm the exact insertion point of the new columns against the latest specification.
