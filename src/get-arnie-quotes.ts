import { httpGet } from "./mock-http-interface";

// http status
enum HttpResponseStatus {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
}

// http responses and result
type TResult = { "Arnie Quote": string } | { FAILURE: string };
type TResponse = ReturnType<typeof httpGet> extends Promise<infer T>
  ? T
  : ReturnType<typeof httpGet>;
type TBody = { message: string };

/**
 * User defined type guard
 * body is typeof TBody if valid
 */
const isValidBody = (body: unknown): body is TBody =>
  typeof (body as TBody).message !== "undefined";

/**
 * Safe JSON body parse
 * returns body message if valid otherwise throw error
 * @param {string} body any string that needs to be parsed
 * @returns {string} body messsage
 */
const parseBody = (body: string): string => {
  try {
    const parsed = JSON.parse(body);
    if (isValidBody(parsed)) {
      return parsed.message;
    }
    throw "Invalid Body";
  } catch {
    throw new Error("Your request has been terminated");
  }
};

/**
 * Transform TResponse to TResult
 * @param {TResponse} param response result from httpGet
 * @returns {TResult}
 */
const toResult = ({ status, body }: TResponse): TResult => {
  try {
    const message = parseBody(body);
    if (status === HttpResponseStatus.INTERNAL_SERVER_ERROR) {
      return { FAILURE: message };
    }

    return { "Arnie Quote": message };
  } catch (e) {
    return {
      FAILURE: e.message,
    };
  }
};

export const getArnieQuotes = async (urls: string[]): Promise<TResult[]> => {
  const responses = await Promise.all(urls.map((url) => httpGet(url)));
  return responses.map(toResult);
};
