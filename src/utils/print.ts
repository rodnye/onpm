import ora, { Color, Ora, Spinner } from "ora";
import chalk from "chalk";

export const print = console.log;
export const printError = (msg: string) => {
  print(chalk.bgRed("Ups...") + " " + chalk.red(msg));
};

export const printWarning = (msg: string) => {
  print(chalk.bgYellow.black("Warning:") + " " + chalk.yellow(msg));
};

export const printSuccess = (msg: string) => {
  print(chalk.bgGreen.black("Success:") + " " + chalk.green(msg));
};

export const printList = (
  items: string[],
  options?: {
    title?: string;
    bullet?: string;
    color?: "green" | "blue" | "yellow" | "magenta" | "cyan" | "white";
  }
) => {
  const { title = "", bullet = "•", color = "green" } = options || {};

  if (title) {
    print(chalk.bold(title));
  }

  items.forEach((item) => {
    print(` ${chalk[color](bullet)} ${item}`);
  });
};


type SpinnerOptions = {
  text?: string;
  spinner?: Spinner;
  color?: Color;
  indent?: number;
  prefixText?: string;
  hideCursor?: boolean;
};

export class PrintWithSpinner {
  private spinner: Ora;
  private lastMessage: string = "";

  constructor(options?: SpinnerOptions) {
    this.spinner = ora({
      text: options?.text || "",
      spinner: options?.spinner || "dots",
      color: options?.color || "cyan",
      indent: options?.indent || 0,
      prefixText: options?.prefixText,
      hideCursor: options?.hideCursor ?? true,
    });
  }

  start(text?: string): void {
    if (text) this.spinner.text = text;
    this.spinner.start();
  }

  update(text: string): void {
    this.lastMessage = text;
    this.spinner.text = text;
  }

  succeed(text?: string): void {
    this.spinner.succeed(text || this.lastMessage);
  }

  fail(text?: string): void {
    this.spinner.fail(text || this.lastMessage);
  }

  warn(text?: string): void {
    this.spinner.warn(text || this.lastMessage);
  }

  info(text?: string): void {
    this.spinner.info(text || this.lastMessage);
  }

  stop(): void {
    this.spinner.stop();
  }

  static create(options?: SpinnerOptions): PrintWithSpinner {
    return new PrintWithSpinner(options);
  }
}

export const printWithSpinner = (
  text: string,
  options?: Omit<SpinnerOptions, "text">
) => {
  const spinner = new PrintWithSpinner({ text, ...options });
  spinner.start();
  return spinner;
};

export const printStep = async <T>(
  text: string,
  action: (spinner: PrintWithSpinner) => Promise<T>,
  options?: SpinnerOptions
): Promise<T> => {
  const spinner = new PrintWithSpinner({ text, ...options });
  try {
    spinner.start();
    const result = await action(spinner);
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail(error instanceof Error ? error.message : "Failed");
    throw error;
  }
};