import { IUserLandTracer } from '@vtex/api'
import { Span, SpanContext, SpanOptions } from 'opentracing'

import { MockOpentracingTracer } from './MockOpentracingTracer'
import { MockSpan } from './MockSpan'

export class MockUserlandTracer implements IUserLandTracer {
  public fallbackSpan: MockSpan
  public mockTracer: MockOpentracingTracer
  public traceSampled = true

  constructor() {
    this.mockTracer = new MockOpentracingTracer()
    this.fallbackSpan = this.mockTracer.startSpan('fallback-span') as MockSpan
    this.fallbackSpan.finish()
  }

  public get isTraceSampled() {
    return this.traceSampled
  }

  public get traceId() {
    return this.fallbackSpan.context().toTraceId()
  }

  public startSpan(name: string, options?: SpanOptions) {
    return this.mockTracer.startSpan(name, options)
  }

  public inject(spanContext: Span | SpanContext, format: string, carrier: any) {
    return this.mockTracer.inject(spanContext, format, carrier)
  }

  public fallbackSpanContext() {
    return this.fallbackSpan.context()
  }
}
