"use client";
import { Button } from "app/components/ui/button";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Input } from "./ui/input";

export function SearchBar() {
  const t = useTranslations("Components.SearchBar");

  const [query, setQuery] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };
  return (
    <form onSubmit={handleSubmit} className="relative w-full ">
      <Input
        type="search"
        value={query}
        onChange={handleInputChange}
        placeholder={t("placeholder")}
        className="w-full ps-8 pe-8 rounded-md border border-input bg-background"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute start-0 top-0 h-full px-2.5 text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
export default SearchBar;
