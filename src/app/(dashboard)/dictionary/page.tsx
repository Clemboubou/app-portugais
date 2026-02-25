import { DictionarySearch } from "@/components/dictionary/dictionary-search";

export default function DictionaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dictionnaire</h1>
        <p className="text-muted-foreground">
          Cherchez un mot en portugais européen — définitions, prononciation et exemples depuis Wiktionary.
        </p>
      </div>
      <DictionarySearch />
    </div>
  );
}
