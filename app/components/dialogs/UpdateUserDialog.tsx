"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Gender,
  updateUserSchema,
  UserInstance,
  UpdateUserSchemaType,
} from "@guy-vaserman/shared-my-training-app";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { countryCodes } from "app/shared/business-rules";
import { translateError } from "app/libs/utils";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserInstance;

  onSave: (
    data: UpdateUserSchemaType,
    user: UserInstance,
  ) => Promise<{ success: boolean; message: string }>;
  onSuccess?: () => void;
}

export default function EditUserDialog({
  isOpen,
  onOpenChange,
  user,

  onSave,
  onSuccess,
}: EditUserDialogProps) {
  const t = useTranslations("Components.UserManager");
  const tCommon = useTranslations("Common");
  const tZod = useTranslations("Zod.errors");
  const { dir } = useLocaleInfo();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || "",
      phone: user.phone ? user.phone.replace(/^\+972/, "") : "", //Also todo
      gender: user.gender,
      birthday: user.birthday || new Date(),
      countryCode: "+972", //Todo, This will be a potenital bug as soon as we support multiple countries, issue is that we currently don't save country codes and would
      //need to add country code to the schema and change some logic that depends on it
      is_active: user.is_active,
      is_coach: user.is_coach,
      is_gym_admin: user.is_gym_admin,
      is_trainee: true,
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open && user) {
      const { user_id, ...editableData } = user;
      form.reset({
        first_name: editableData.first_name || "",
        last_name: editableData.last_name || "",
        gender: editableData.gender || Gender.OTHER,
        phone: editableData.phone || "",
        email: editableData.email || "",
        birthday: editableData.birthday || new Date(),
        countryCode: "+972",
        is_coach: !!editableData.is_coach,
        is_trainee: true,
        is_gym_admin: !!editableData.is_gym_admin,
        is_active:
          editableData.is_active === null ? true : !!editableData.is_active,
      });
    } else if (open && !user) {
      form.reset();
    }
    setError(null);
    onOpenChange(open);
  };

  const onSubmit = async (data: UpdateUserSchemaType) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await onSave(data, user);

      if (response.success) {
        onOpenChange(false);
        form.reset();
        onSuccess?.();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: Gender.MALE, label: t("gender.male") },
    { value: Gender.FEMALE, label: t("gender.female") },
    { value: Gender.OTHER, label: t("gender.other") },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{user ? t("editUser") : t("createNewUser")}</DialogTitle>
          <DialogDescription>
            {user ? t("editUserDescription") : t("createNewUserDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            dir={dir}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.firstName.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("fields.firstName.placeholder")}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.first_name?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.lastName.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("fields.lastName.placeholder")}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.last_name?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.email.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("fields.email.placeholder")}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.email?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field: countryField }) => (
                  <FormItem>
                    <FormLabel>{t("fields.phone.label")}</FormLabel>
                    <FormControl>
                      <div dir="ltr" className="flex gap-x-2">
                        <Select
                          value={countryField.value}
                          onValueChange={countryField.onChange}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="+972" />
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes &&
                              Array.isArray(countryCodes) &&
                              countryCodes.map((country) => (
                                <SelectItem
                                  key={country.code}
                                  value={country.code}
                                >
                                  {country.emoji} {country.code}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field: phoneField }) => (
                            <Input
                              {...phoneField}
                              placeholder={t("fields.phone.placeholder")}
                              className="flex-1"
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.phone?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.gender.label")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("fields.gender.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem
                            key={option.value || "NONE"}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.gender?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.birthday.label")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split("T")[0]
                            : field.value || ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.birthday?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <Label className="text-base font-medium block">
                {t("fields.roles.label")}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="is_coach"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>{t("roles.coach")}</Label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_gym_admin"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>{t("roles.gymAdmin")}</Label>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label>{t("fields.active.label")}</Label>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {tCommon("cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
