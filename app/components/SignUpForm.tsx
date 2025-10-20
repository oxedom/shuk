"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { countryCodes } from "app/shared/business-rules";
import { userSignup } from "app/backend/actions";
import { Button } from "app/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "app/components/ui/form";
import { Input } from "app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/components/ui/select";
import { toast } from "app/hooks/use-toast";
import { Gender } from "@oxedom/shared-shuk";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import SetLanguageButton from "./SetLanguageButton";
import {
  SignupFormSchema,
  SignupFormSchemaType,
} from "@oxedom/shared-shuk";
import { setDocumentPrimaryColorStyle } from "app/libs/color-theme";
import { truncateString, translateError } from "app/libs/utils";

function SignupForm() {
  const router = useRouter();
  const t = useTranslations("Components.SignUpForm");
  const tCommon = useTranslations("Common");
  const tGender = useTranslations("Components.UserManager.gender");
  const tZod = useTranslations("Zod.errors");
  const { isHebrew, dir } = useLocaleInfo();

  const form = useForm({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      countryCode: "+972",
      phone: "",
      gender: Gender.OTHER,
      gym_id: 0,
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);



  // Fetch active gyms and handle query parameter on component mount



  const onSubmit = async (data: SignupFormSchemaType) => {
    setLoading(true);
    setError(null);
    try {
      // Combine country code and phone number for E.164 format

      await userSignup(data);
      router.push("/dashboard");
      toast({
        title: t("success.title"),
      });

      // Clear gym ID from localStorage after successful signup
      try {
        localStorage.removeItem("gi");
      } catch (err) {
        console.error("Issue with localstorage");
      }
      reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.warn(err);
        setError(err.message || "An error occurred");
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3500);
    }
  };
  return (
    <div className="bg-card p-6 rounded-lg h-screen  ">

        {error && (
          <div className="bg-destructive text-destructive-foreground p-4 rounded">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.firstName.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.firstName.placeholder")}
                      {...field}
                      className="w-full mt-1"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-sm">
                    {translateError(
                      form.formState.errors.firstName?.message,
                      tZod,
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.lastName.label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("fields.lastName.placeholder")}
                      {...field}
                      className="w-full mt-1"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-sm">
                    {translateError(
                      form.formState.errors.lastName?.message,
                      tZod,
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="countryCode"
              render={({ field: countryField }) => (
                <FormItem>
                  <FormLabel>{t("fields.phoneNumber.label")}</FormLabel>
                  <FormControl dir={"ltr"}>
                    <div className="flex gap-x-2">
                      <Select
                        value={countryField.value}
                        onValueChange={countryField.onChange}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue
                            placeholder={t(
                              "fields.phoneNumber.countryCodePlaceholder",
                            )}
                          />
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
                        control={control}
                        name="phone"
                        render={({ field: phoneField }) => (
                          <Input
                            autoComplete="off"
                            placeholder={t("fields.phoneNumber.placeholder")}
                            {...phoneField}
                            className="flex-1"
                          />
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive text-sm">
                    {translateError(form.formState.errors.phone?.message, tZod)}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.gender.label")}</FormLabel>
                  <FormControl>
                    <Select
                      dir={dir}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue
                          placeholder={t("fields.gender.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>
                          {tGender("male")}
                        </SelectItem>
                        <SelectItem value={Gender.FEMALE}>
                          {tGender("female")}
                        </SelectItem>
                        <SelectItem value={Gender.OTHER}>
                          {tGender("other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-destructive text-sm">
                    {translateError(
                      form.formState.errors.gender?.message,
                      tZod,
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />


            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? t("submitting") : t("submitButton")}
            </Button>
          </form>
        </Form>
        <div>
          <div className="mt-6">
            <SetLanguageButton displayLabel={false} />
          </div>
        </div>
      </div>

  );
}
export default SignupForm;
