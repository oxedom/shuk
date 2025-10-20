### **PDR: Fixes for GYM Admin Manager**

1. **Trainee Role Handling**
   - Remove the option to select trainee status in both frontend and backend.
   - Default `is_trainee` to `true` backend-side only.

2. **User Update Flow**
   - Ensure the **Update User** form prepopulates with existing user data (currently broken).

3. **Create User Flow**
   - Fix the **Create User** form to trigger a proper server action request on submit.
   - Ensure full flow (submit → backend → response → UI update) works correctly.

4. **Phone Number Handling**
   - In **EditUserForm** and **CreateUserForm**, match the phone input behavior in `SignupForm.tsx`:
     - Include a country code selector.
     - Preselect default country code as `+972`.

5. **Action Response Handling**
   - Actions don’t throw on failure (unless 500).
   - After any action:
     - Check `response.status` (boolean).
     - If `true`: call `router.refresh()` and show a success toast.
     - If `false`: show a descriptive error toast.
