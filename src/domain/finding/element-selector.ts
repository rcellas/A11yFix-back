export interface ElementSelectorProps {
  cssSelector: string;
  role?: string;
  accessibleName?: string;
  xpath?: string;
}

/**
 * Value Object representing the semantic and structural selector for a DOM element.
 * Prefers semantic ARIA role & accessible name over brittle CSS selectors.
 */
export class ElementSelector {
  private readonly _cssSelector: string;
  private readonly _role?: string;
  private readonly _accessibleName?: string;
  private readonly _xpath?: string;

  private constructor(props: ElementSelectorProps) {
    if (!props.cssSelector || props.cssSelector.trim().length === 0) {
      throw new Error('ElementSelector requires a non-empty cssSelector.');
    }
    this._cssSelector = props.cssSelector.trim();
    this._role = props.role?.trim();
    this._accessibleName = props.accessibleName?.trim();
    this._xpath = props.xpath?.trim();
  }

  public static create(props: ElementSelectorProps): ElementSelector {
    return new ElementSelector(props);
  }

  public static fromCss(cssSelector: string): ElementSelector {
    return new ElementSelector({ cssSelector });
  }

  public get cssSelector(): string {
    return this._cssSelector;
  }

  public get role(): string | undefined {
    return this._role;
  }

  public get accessibleName(): string | undefined {
    return this._accessibleName;
  }

  public get xpath(): string | undefined {
    return this._xpath;
  }

  public hasSemanticRole(): boolean {
    return Boolean(this._role && this._role.length > 0);
  }

  /**
   * Generates an idiomatic Playwright locator string using semantic locators where possible.
   * Prioritizes getByRole > getByLabel/getByText > locator(css).
   */
  public toPlaywrightLocator(): string {
    if (this._role) {
      if (this._accessibleName) {
        return `page.getByRole('${this._role}', { name: '${this._accessibleName.replace(/'/g, "\\'")}' })`;
      }
      return `page.getByRole('${this._role}')`;
    }

    if (this._accessibleName) {
      return `page.getByLabel('${this._accessibleName.replace(/'/g, "\\'")}')`;
    }

    return `page.locator('${this._cssSelector.replace(/'/g, "\\'")}')`;
  }

  public equals(other?: ElementSelector | null): boolean {
    if (!other) return false;
    return (
      this._cssSelector === other._cssSelector &&
      this._role === other._role &&
      this._accessibleName === other._accessibleName
    );
  }

  public toJSON(): ElementSelectorProps {
    return {
      cssSelector: this._cssSelector,
      role: this._role,
      accessibleName: this._accessibleName,
      xpath: this._xpath,
    };
  }
}
