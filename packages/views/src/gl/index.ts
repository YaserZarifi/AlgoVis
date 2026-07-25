/**
 * Context, framebuffer, and shader plumbing. Roughly 400 lines written once and owned, rather
 * than a scene graph we do not need — the entire visual identity of this project is the post
 * chain, and that requires direct framebuffer control (§3).
 *
 * All GLSL lives in .glsl files imported as strings, never in template literals (§19).
 */

export interface Framebuffer {
  handle: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

export function createContext(_canvas: HTMLCanvasElement): WebGL2RenderingContext {
  throw new Error("not implemented: createContext (Phase 2)");
}

/** Ping-pong target for the post chain. Colour is float, because the chain works in linear
 *  space and converts to sRGB exactly once, at the end (§10.6). */
export function createFramebuffer(
  _gl: WebGL2RenderingContext,
  _width: number,
  _height: number,
): Framebuffer {
  throw new Error("not implemented: createFramebuffer (Phase 2)");
}

export function compileProgram(
  _gl: WebGL2RenderingContext,
  _vertexSource: string,
  _fragmentSource: string,
): WebGLProgram {
  throw new Error("not implemented: compileProgram (Phase 2)");
}
