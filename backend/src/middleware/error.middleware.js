const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function getErrorChain(error) {
  const chain = [];
  const visited = new Set();
  let current = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    chain.push(current);
    visited.add(current);
    current = current.cause ?? current.sourceError;
  }

  return chain;
}

function isConnectionError(errorChain) {
  return errorChain.some((item) => {
    const code = typeof item.code === "string" ? item.code.toUpperCase() : "";
    const message =
      typeof item.message === "string" ? item.message.trim().toLowerCase() : "";

    return NETWORK_ERROR_CODES.has(code) || message === "fetch failed";
  });
}

function logServerError(operation, errorChain, connectionError) {
  const errorTypes = errorChain
    .map((item) => item.name)
    .filter(
      (name) =>
        typeof name === "string" && /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(name),
    );
  const errorCodes = errorChain
    .map((item) => item.code)
    .filter(
      (code) => typeof code === "string" && /^[A-Z0-9_-]{1,32}$/.test(code),
    );
  const details = [
    connectionError ? "connection failure" : "request failure",
    ...new Set(errorTypes),
    ...new Set(errorCodes),
  ];

  console.error(`${operation}: ${details.join(" | ")}`);
}

export function sendServerError(res, error, operation, message) {
  const errorChain = getErrorChain(error);
  const connectionError = isConnectionError(errorChain);

  logServerError(operation, errorChain, connectionError);

  return res.status(connectionError ? 503 : 500).json({
    success: false,
    message: connectionError
      ? "The service is temporarily unavailable. Please try again shortly."
      : message,
  });
}

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: "The requested endpoint was not found.",
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const errorChain = getErrorChain(error);
  const connectionError = isConnectionError(errorChain);
  logServerError("Unhandled request", errorChain, connectionError);

  const errorStatus = error.status ?? error.statusCode;
  const status =
    connectionError
      ? 503
      : Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus < 500
        ? errorStatus
        : 500;
  const message =
    status === 503
      ? "The service is temporarily unavailable. Please try again shortly."
      : status >= 500
        ? "Something went wrong on our end. Please try again later."
        : status === 400
          ? "The request could not be processed. Please check the submitted data."
          : "The request could not be completed.";

  return res.status(status).json({
    success: false,
    message,
  });
}
