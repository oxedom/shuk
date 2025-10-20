"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Gender,
  addUserToGymSchema,
  AddUserToGymSchemaType,
  GymRowData,
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

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gyms?: GymRowData[];
  onSave: (data: AddUserToGymSchemaType) => Promise<void>;
  onSuccess?: () => void;
}

export default function AddUserDialog({
  isOpen,
  onOpenChange,
  onSave,
  onSuccess,
  gyms,
}: AddUserDialogProps) {
  const t = useTranslations("Components.UserManager");
  const tCommon = useTranslations("Common");
  const tZod = useTranslations("Zod.errors");
  const { dir, isHebrew } = useLocaleInfo();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(addUserToGymSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      countryCode: "+972",
      gender: Gender.MALE,
      birthday: new Date(),
      is_active: true,
      is_coach: false,
      is_trainee: true,
      is_gym_admin: false,
      ...(gyms && gyms.length ? { gym_id: 1 } : {}),
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      form.reset();
    }
    setError(null);
    onOpenChange(open);
  };

  const onSubmit = async (data: AddUserToGymSchemaType) => {
    setIsLoading(true);
    setError(null);

    try {
      let formatedEmail = data.email ? data.email.toLowerCase() : data.email;

      const formattedData = {
        ...data,
        email: formatedEmail,
      };

      await onSave(formattedData);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions: { value: Gender; label: string }[] = [
    { value: Gender.MALE, label: tCommon("genderType.MALE") },
    { value: Gender.FEMALE, label: tCommon("genderType.FEMALE") },
    { value: Gender.OTHER, label: tCommon("genderType.OTHER") },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t("createNewUser")}</DialogTitle>
          <DialogDescription>{t("createNewUserDescription")}</DialogDescription>
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

            {gyms && gyms.length > 0 && (
              <FormField
                control={form.control}
                name="gym_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.gym.label")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("fields.gym.placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gyms.map((gym) => (
                          <SelectItem
                            key={gym.gym_id}
                            value={gym.gym_id.toString()}
                          >
                            {isHebrew ? gym.hebrew_name : gym.english_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-destructive text-sm">
                      {translateError(
                        form.formState.errors.gym_id?.message,
                        tZod,
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium block">
                {t("fields.roles.label")}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
                <FormField
                  control={form.control}
                  name="is_coach"
                  render={({ field }) => (
                    <FormItem className="flex items-center  space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer ">
                      <FormControl>
                        <Checkbox
                          className=""
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <Label className="">{t("roles.coach")}</Label>
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
              </div>

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
