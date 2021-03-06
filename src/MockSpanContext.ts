import { SpanContext } from 'opentracing'

import { MockSpan } from './MockSpan'

/**
 * OpenTracing Context implementation designed for use in
 * unit tests.
 */
export class MockSpanContext extends SpanContext {
  //- -----------------------------------------------------------------------//
  // MockContext-specific
  //- -----------------------------------------------------------------------//

  private _span: MockSpan

  constructor(span: MockSpan) {
    super()
    // Store a reference to the span itself since this is a mock tracer
    // intended to make debugging and unit testing easier.
    this._span = span
  }

  public span(): MockSpan {
    return this._span
  }
}
