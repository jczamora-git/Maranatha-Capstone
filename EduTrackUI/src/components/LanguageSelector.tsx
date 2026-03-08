import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/TranslationContext';
import { Languages, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  variant = 'ghost',
  size = 'default',
  showLabel = true,
  className,
}: LanguageSelectorProps) {
  const { currentLanguage, setLanguage, languages } = useTranslation();

  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Languages className="h-4 w-4" />
          {showLabel && (
            <>
              <span className="hidden sm:inline">{currentLang?.flag} {currentLang?.name}</span>
              <span className="sm:hidden">{currentLang?.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'cursor-pointer flex items-center justify-between',
                currentLanguage === lang.code && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact language selector for mobile or tight spaces
 */
export function CompactLanguageSelector({ className }: { className?: string }) {
  const { currentLanguage, setLanguage, languages } = useTranslation();
  const currentLang = languages.find((lang) => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative hover:bg-muted", className)}
          title="Change Language"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Select Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                currentLanguage === lang.code && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                </div>
              </div>
              {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
