import jwt from "jsonwebtoken";
import config from "config";
import { FastifyReply, FastifyRequest } from "fastify";

const publicKey = Buffer.from(
  config.get<string>("accessTokenPublicKey"),
  "base64"
).toString("ascii");

// const privateKey = Buffer.from(
//   config.get<string>("accessTokenPrivateKey"),
//   "base64"
// ).toString("ascii");

// function signJwt(object: Object, options?: jwt.SignOptions | undefined) {
//   return jwt.sign(object, privateKey, {
//     ...(options && options),
//     algorithm: "RS256",
//   });
// }

// console.log(signJwt({ name: "dave" }));

function verifyJwt<T>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function verifyUser(req: FastifyRequest) {
  const authorization = req.headers.authorization;

  const decoded = authorization
    ? verifyJwt<{ name: string }>(authorization.replace("Bearer ", ""))
    : null;

  if (!decoded) {
    return false;
  }

  if (
    !decoded.name ||
    !["tom", "dave", "david"].includes(decoded.name.toLowerCase())
  ) {
    return false;
  }
  return !!decoded;
}
