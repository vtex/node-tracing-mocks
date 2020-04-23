import * as opentracing from 'opentracing'

import { MockReport } from './MockReport'
import { MockSpan } from './MockSpan'
import { MockSpanContext } from './MockSpanContext'

/**
 * OpenTracing Tracer implementation designed for use in unit tests.
 */
export class MockOpentracingTracer extends opentracing.Tracer {
  private _spans: MockSpan[]

  //- -----------------------------------------------------------------------//
  // OpenTracing implementation
  //- -----------------------------------------------------------------------//

  protected _startSpan(name: string, fields: opentracing.SpanOptions): MockSpan {
    // _allocSpan is given it's own method so that derived classes can
    // allocate any type of object they want, but not have to duplicate
    // the other common logic in startSpan().
    const span = this._allocSpan()
    span.setOperationName(name)
    this._spans.push(span)

    if (fields.references) {
      for (const ref of fields.references) {
        span.addReference(ref)
      }
    }

    // Capture the stack at the time the span started
    span._startStack = new Error().stack
    return span
  }

  protected _inject(span: MockSpanContext, format: any, carrier: any) {
    if (format !== opentracing.FORMAT_HTTP_HEADERS) {
      throw new Error('NOT YET IMPLEMENTED')
    }

    carrier['span-id'] = span.span().uuid()
  }

  protected _extract(format: any, carrier: any): never {
    throw new Error('NOT YET IMPLEMENTED')
  }

  //- -----------------------------------------------------------------------//
  // MockTracer-specific
  //- -----------------------------------------------------------------------//

  constructor() {
    super()
    this._spans = []
  }

  private _allocSpan(): MockSpan {
    return new MockSpan(this)
  }

  /**
   * Discard any buffered data.
   */
  public clear(): void {
    this._spans = []
  }

  /**
   * Return the buffered data in a format convenient for making unit test
   * assertions.
   */
  public report(): MockReport {
    return new MockReport(this._spans)
  }
}
