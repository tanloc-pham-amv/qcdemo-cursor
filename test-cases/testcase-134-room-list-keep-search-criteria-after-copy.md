No.134 Room list - Keep search criteria after copying

## Object
Room list screen (部屋一覧 / Room list) - Copy (コピー / copy)

## Overview
On the Room list screen, there is a difference in the behavior of keeping search conditions after performing `Copy`.

### Current behavior: Search by Property code (物件コード)
After you perform `Copy` and then refresh/reload the Room list screen:
- The entered Property code remains populated.
- The search results that match the entered Property code remain displayed.

### Current behavior: Search by Property name (物件名)
After you perform `Copy` and then refresh/reload the Room list screen:
- The entered Property name is cleared.
- The Room list is reset and shows all records.

## Required change
Modify the behavior so that even when searching by `Property name` and performing `Copy`, the entered search condition is kept and the corresponding search results remain displayed (same behavior as `Property code`).

Property name Kana (物件名カナ) behavior has not yet been confirmed. If needed, it should be supported similarly to `Property name`.

## Goal
In the Room list screen, immediately after `Copy`, keep the search condition for the following items. Search results matching that condition should still be displayed:
- Property code (物件コード)
- Property name (物件名)
- Property name Kana (物件名カナ)

## Test Steps & Expected Results

### TC-1: Property code is retained after Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Enter a value into **Property code** (物件コード).
3. Click **検索 / Search**.
4. Confirm that the list is filtered (only matching records are shown).
5. Perform `Copy` for any visible record on the list (the “Copy” operation available on the Room list screen).
6. After the copy operation finishes, refresh/reload the Room list screen (or return to the list such that it reloads).

**Expected**
1. The **Property code** input value remains populated with the value entered before `Copy`.
2. The list remains filtered and displays results matching the entered **Property code**.

### TC-2: Property name is retained after Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Enter a value into **Property name** (物件名).
3. Click **検索 / Search**.
4. Confirm that the list is filtered (only matching records are shown).
5. Perform `Copy` for any visible record on the list (the “Copy” operation available on the Room list screen).
6. After the copy operation finishes, refresh/reload the Room list screen (or return to the list such that it reloads).

**Expected (after fix)**
1. The **Property name** input value is NOT cleared; it remains populated with the value entered before `Copy`.
2. The list remains filtered and displays results matching the entered **Property name**.

### TC-3: Property name Kana is retained after Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Enter a value into **Property name Kana** (物件名カナ).
3. Click **検索 / Search**.
4. Confirm that the list is filtered (only matching records are shown).
5. Perform `Copy` for any visible record on the list (the “Copy” operation available on the Room list screen).
6. After the copy operation finishes, refresh/reload the Room list screen (or return to the list such that it reloads).

**Expected (if supported)**
1. The **Property name Kana** input value is NOT cleared; it remains populated with the value entered before `Copy`.
2. The list remains filtered and displays results matching the entered **Property name Kana**.

### TC-4: Search with multiple conditions is retained after Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Enter values into **Property code** (物件コード) and **Property name** (物件名) at the same time (multi-condition search).
3. Click **検索 / Search**.
4. Confirm that the list is filtered by both conditions.
5. Perform `Copy` for any visible record on the list.
6. After the copy operation finishes, refresh/reload the Room list screen (or return to the list such that it reloads).

**Expected (after fix)**
1. Both **Property code** and **Property name** input values remain populated with the values entered before `Copy`.
2. The list remains filtered and displays results matching the combination of **Property code** + **Property name**.

### TC-5: No search conditions is retained after Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Ensure that all search inputs are empty (no search conditions are applied):
   - Leave **Property code** / **Property name** / **Property name Kana** blank.
3. Click **検索 / Search** (with all inputs empty).
4. Confirm that the list shows all records (or the default unfiltered state).
5. Perform `Copy` for any visible record on the list.
6. After the copy operation finishes, refresh/reload the Room list screen.

**Expected**
1. All search inputs remain empty (no condition is unexpectedly filled or cleared incorrectly).
2. The list remains in the unfiltered/default state (shows all records).

### TC-6: Copy performed twice keeps search conditions after each Copy
**Preconditions**
- User is logged in and can access the Room list screen (部屋一覧 / Room list).

**Steps**
1. Open the Room list screen.
2. Enter a value into **Property name** (物件名).
3. Click **検索 / Search**.
4. Confirm that the list is filtered.
5. Perform `Copy` for any visible record.
6. After the first copy operation finishes, refresh/reload the Room list screen.
7. Perform `Copy` again for any visible record on the (still filtered) list.
8. After the second copy operation finishes, refresh/reload the Room list screen again.

**Expected (after fix)**
1. After the first refresh/reload, the **Property name** value remains populated and the list remains filtered.
2. After the second refresh/reload, the **Property name** value is still NOT cleared and the list continues to display results matching the entered **Property name**.

**Note**
If Property name Kana is not part of scope, record actual behavior and report the gap.