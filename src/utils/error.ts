import { IPackageIdentifier } from "./pkg";

export type ExceptionParams = {
  code: string;
  message: string;
  details?: string;
  metadata?: Record<string, any>;
  cause?: Error;
};

export class Exception extends Error {
  public readonly code: string;
  public readonly details: string;
  public readonly metadata: Record<string, any>;
  public readonly timestamp: Date;
  public readonly cause?: Error;

  constructor(params: ExceptionParams) {
    super(params.message);

    this.name = this.constructor.name;
    this.code = params.code;
    this.details = params.details || params.message;
    this.metadata = params.metadata || {};
    this.cause = params.cause;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    if (params.cause && params.cause.stack) {
      this.stack = `${this.stack}\nCaused by: ${params.cause.stack}`;
    }
  }

  toString() {
    return `[${this.name}][${this.code}] ${this.message}\n${this.details}${
      this.cause ? `\nCaused by: ${this.cause}` : ""
    }`;
  }
}

export class PackageParseException extends Exception {
  constructor(message: string) {
    super({
      code: "PKG_PARSE_ERROR",
      message: "Error processing the package: " + message,
    });
  }
}
export class PackagesException extends Exception {
  constructor(
    packages: IPackageIdentifier[],
    params: Omit<ExceptionParams, "code"> & { code?: string }
  ) {
    super({
      code: params.code || "PKG_ERROR",
      message: `Packages errors: ${params.message}`,
      details:
        params.details ||
        `Error processing the packages: ${packages.map(([name]) => name).join(", ")}`,
      metadata: { packages, ...params.metadata },
      cause: params.cause,
    });
  }
}

// Errores de instalación
export class InstallsException extends PackagesException {
  constructor(packages: IPackageIdentifier[], cause?: Error) {
    super(packages, {
      code: "INSTALL_FAILED",
      message: `Failed to install packages.`,
      cause,
    });
  }
}
