import { TcombUpdate, TcombUpdatesState, Token } from './lib'
import { Observable } from 'rxjs'
import { ComponentSinks, ComponentSources } from './lib/plugins';

declare module './lib' {
  interface DriverExecution {
    token: Token
    updates: Observable<TcombUpdatesState>
    responses: Observable<any>
    events (eventName: string): Observable<TcombUpdate>
    dispose (): void
  }
}

declare module './lib/plugins' {
  interface PluginsExecution {
    matchWith (this: Observable<TcombUpdate>,
               plugins: Plugin[],
               sources: ComponentSources,
      {dupe}?: {dupe?: boolean}): Observable<ComponentSinks>

    matchStream (sourceObservable: Observable<TcombUpdate>,
                 ...args: any[]): Observable<ComponentSinks>
  }

  interface matchWith {
    (this: Observable<TcombUpdate>,
    plugins: Plugin[],
    sources: ComponentSources,
    {dupe}?: {dupe?: boolean}): Observable<ComponentSinks> }

  interface matchStream {
    (sourceObservable: Observable<TcombUpdate>,
    ...args: any[]): Observable<ComponentSinks> }
}

