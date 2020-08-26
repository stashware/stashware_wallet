// @ts-ignore
import NodeRsa from 'node-rsa'
// @ts-ignore
import base58 from 'bs58'
import { sha256 } from 'js-sha256'
import { Buffer } from 'buffer'
// @ts-ignore
import ripemd160 from 'ripemd160'
import * as bitcoin from 'bitcoinjs-lib'


export function str2buf(str: string) {
  const array = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) {
    array[i] = str.charCodeAt(i)
  }
  return array
}

export function num2buf(value: number) {
  const radixStr = value.toString(16).padStart(16, '0')
  const arr = []
  for (let i = 0; i < radixStr.length; i += 2) {
    const n = parseInt(radixStr.slice(i, i + 2), 16)
    arr.push(n)
  }
  return new Uint8Array(arr)
}


/**
 * Creates a new Uint8Array based on two different ArrayBuffers
 *
 * @private
 * @param {ArrayBuffers} buffer1 The first buffer.
 * @param {ArrayBuffers} buffer2 The second buffer.
 * @return {ArrayBuffers} The new ArrayBuffer created out of the two.
 */
export function appendBuffer(buffer1: Uint8Array, buffer2: Uint8Array) {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp
}

export function buf2hex(buf: Uint8Array) {
  return Array.prototype.map.call(buf, x => ('00' + x.toString(16)).slice(-2)).join('')
}

export function hex2buf(hex: string) {
  return new Buffer(hex, 'hex')
}

// export function buf2str(buf: Uint8Array) {
//   return String.fromCharCode.apply(null, buf as any)
// }

export function obj2buf(obj: any) {
  return Object.keys(obj).reduce((pre, key, i) => {
    let buf: Uint8Array = new Uint8Array()
    if (typeof obj[key] === 'number') {
      buf = num2buf(obj[key])
    }
    if (obj[key] instanceof Uint8Array) {
      buf = obj[key]
    }
    if (typeof obj[key] === 'string') {
      // buf = base58.decode(obj[key])
      buf = str2buf(obj[key]) 
    }
    return appendBuffer(pre, buf)
  }, new Uint8Array())
}

export function getPublicKeyByPrivateKey(privateKey: string) {
  const key = new NodeRsa(
    hex2buf(privateKey),
    'private-der'
  )
  return buf2hex(key.exportKey('public-der'))
}

export function getAddressByPublicKey(publicKey: string) {
  const pub = hex2buf(publicKey)
  const hash = sha256.array(pub)
  const publicKeyHash = new ripemd160().update(Buffer.from(hash)).digest()
  const step1 = Buffer.from('05' + buf2hex(publicKeyHash), 'hex')
  const step2 = sha256(step1)
  const step3 = sha256(Buffer.from(step2, 'hex'))
  const checksum = step3.substring(0, 8)
  const step4 = step1.toString('hex') + checksum
  const address = base58.encode(Buffer.from(step4, 'hex'))
  return address
}

export function generateKeys() {
  const rsaKey = new NodeRsa(undefined, undefined, { enviroment: 'browser' })
  rsaKey.generateKeyPair(2048, 65537)
  const privateKey: string = buf2hex(rsaKey.exportKey('private-der'))
  const publicKey: string = getPublicKeyByPrivateKey(privateKey)
  const address: string = getAddressByPublicKey(publicKey)
  const data = {
    address,
    publicKey,
    privateKey,
  }
  return data
}

