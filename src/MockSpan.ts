import * as opentracing from 'opentracing'

import { MockSpanContext } from './MockSpanContext'
import { MockOpentracingTracer } from './MockOpentracingTracer'

interface Log {
  fields: { [key: string]: any }
  timestamp?: number
}

export interface DebugInfo {
  uuid: string
  operation: string
  millis: [number, number, number]
  tags?: { [key: string]: any }
}

/**
 * OpenTracing Span implementation designed for use in unit tests.
 */
export class MockSpan extends opentracing.Span {
  private _operationName: string
  private _tags: { [key: string]: any }
  private _logs: Log[]
  public _finishMs: number
  private _mockTracer: MockOpentracingTracer
  private _uuid: string
  private _startMs: number
  private _references: opentracing.Reference[]
  public _startStack?: string

  //- -----------------------------------------------------------------------//
  // OpenTracing implementation
  //- -----------------------------------------------------------------------//

  protected _context(): MockSpanContext {
    return new MockSpanContext(this)
  }

  protected _setOperationName(name: string): void {
    this._operationName = name
  }

  protected _addTags(set: { [key: string]: any }): void {
    const keys = Object.keys(set)
    for (const key of keys) {
      this._tags[key] = set[key]
    }
  }

  protected _log(fields: { [key: string]: any }, timestamp?: number): void {
    this._logs.push({
      fields,
      timestamp,
    })
  }

  protected _finish(finishTime?: number): void {
    this._finishMs = finishTime ?? Date.now()
  }

  //- -----------------------------------------------------------------------//
  // MockSpan-specific
  //- -----------------------------------------------------------------------//

  constructor(tracer: MockOpentracingTracer) {
    super()
    this._mockTracer = tracer
    this._uuid = this._generateUUID()
    this._startMs = Date.now()
    this._finishMs = 0
    this._operationName = ''
    this._tags = {}
    this._logs = []
    this._references = []
  }

  public uuid(): string {
    return this._uuid
  }

  public operationName(): string {
    return this._operationName
  }

  public durationMs(): number {
    return this._finishMs - this._startMs
  }

  public tags(): { [key: string]: any } {
    return this._tags
  }

  public tracer(): opentracing.Tracer {
    return this._mockTracer
  }

  private _generateUUID(): string {
    const p0 = `00000000${Math.abs((Math.random() * 0xffffffff) | 0).toString(16)}`.substr(-8)
    const p1 = `00000000${Math.abs((Math.random() * 0xffffffff) | 0).toString(16)}`.substr(-8)
    return `${p0}${p1}`
  }

  public addReference(ref: opentracing.Reference): void {
    this._references.push(ref)
  }

  /**
   * Returns a simplified object better for console.log()'ing.
   */
  public debug(): DebugInfo {
    const obj: DebugInfo = {
      uuid: this._uuid,
      operation: this._operationName,
      millis: [this._finishMs - this._startMs, this._startMs, this._finishMs],
    }
    if (Object.keys(this._tags).length) {
      obj.tags = this._tags
    }
    return obj
  }
}
