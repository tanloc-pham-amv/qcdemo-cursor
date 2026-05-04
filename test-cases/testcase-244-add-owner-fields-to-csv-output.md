No.244 Add the owner code and the owner estimation amount to the CSV output

## Object
CSV export output (CSV出力 / CSV output)

## Overview
The CSV export must include additional owner-related columns sourced from the owner information group and the estimate-for-owner group.

## Required change
Add the following fields to the CSV output:
1. **家主コード / Owner code**
   - Source: **家主情報グループ / Owner info group**
2. **家主見積承諾日 / Owner estimation approval date**
   - Format: `YYYY/MM/DD`
3. **家主見積金額 / Owner estimation amount**
   - Source: **オーナーへの見積グループ / Estimate group for the owner**
   - Format: amount value as exported by the CSV
4. **見積交渉メモ / Estimate negotiation memo**
   - Source: **オーナーへの見積グループ / Estimate group for the owner**
   - Format: multi-line text

## Goal
When a user performs CSV export, the generated file includes the four owner-related columns with the correct values and formatting rules.

## Test Steps & Expected Results

### TC-1: CSV export includes the new owner-related columns in the header
**Preconditions**
- User can access the target screen that provides CSV export.
- Test data exists for at least one record that has owner information and estimate-for-owner information.

**Steps**
1. Open the target screen.
2. Search or filter so that the known test record is included in the export target.
3. Execute CSV export.
4. Open the generated CSV file.
5. Check the header row.

**Expected**
1. The CSV header contains the following columns:
   - **家主コード / Owner code**
   - **家主見積承諾日 / Owner estimation approval date**
   - **家主見積金額 / Owner estimation amount**
   - **見積交渉メモ / Estimate negotiation memo**
2. The new columns appear in the expected output schema position for this feature release.
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
2. The value is exported in the correct row for the target record.

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
2. The date format is exactly `YYYY/MM/DD`.
3. The exported value does not contain time information.

### TC-4: Owner estimation amount is exported from the estimate-for-owner group
**Preconditions**
- A test record exists with a known **家主見積金額 / Owner estimation amount** in the **オーナーへの見積グループ / Estimate group for the owner**.
- The source value is not empty.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV and find the row for the known record.
5. Check the value in the **家主見積金額 / Owner estimation amount** column.

**Expected**
1. The exported **家主見積金額 / Owner estimation amount** exactly matches the amount stored in the **オーナーへの見積グループ / Estimate group for the owner**.
2. The value is exported as an amount field in the format defined by the CSV output.

### TC-5: Estimate negotiation memo is exported with multi-line text preserved
**Preconditions**
- A test record exists with **見積交渉メモ / Estimate negotiation memo** containing multiple lines in the **オーナーへの見積グループ / Estimate group for the owner**.

**Steps**
1. Open the target screen.
2. Filter the data so the known record is included.
3. Execute CSV export.
4. Open the generated CSV in a way that preserves raw cell content.
5. Find the row for the known record and inspect the **見積交渉メモ / Estimate negotiation memo** column.

**Expected**
1. The exported memo matches the source text content.
2. Line breaks are preserved correctly for the memo field.
3. The CSV remains valid and the row structure is not broken by the multi-line value.

### TC-6: Empty owner-related fields are exported as empty values
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
3. No placeholder text such as `null`, `undefined`, or invalid default values is output.

### TC-7: Export handles a mix of populated and empty owner fields correctly
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

### TC-8: Multiple exported rows each show the correct owner-related values
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

## Notes
- Validate the CSV using a raw text editor or CSV-aware tool when checking multi-line memo behavior.
- If the product defines a strict column order for CSV output, confirm the exact insertion point of the new columns against the latest specification.
