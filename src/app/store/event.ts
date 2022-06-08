import { Action, ActionCreator, Creator } from "@ngrx/store";
import { OnReducer, ReducerTypes } from "@ngrx/store/src/reducer_creator";
import { filter, OperatorFunction } from "rxjs";

export interface Event<VerbType extends string = string> extends Action {
    // action type string literal = `[soruce] verb`
    readonly verb: VerbType; // event description
    readonly source: string; // event soruce
    [other: string]: any;
  }

export function toEvent(source: string, verb: string): Event {
    return {
        verb,
        source,
        type: `[${source}] ${verb}`,
    };
}

export type EventAssemblerNoPayload = (source: string) => Event;
export type EventAssembler<Payload> = (source: string, payload: Payload) => Event & Payload;

export type EventCreatorNoPayload = () => Event;
export type EventCreator<Payload> = (payload: Payload) => Event & Payload;

export interface VerbedEvent {
    verb: string;
}

// Reusable events without restating the verb & with varying source dynamically
// pe = prepareEvent('Clicked locations dropdown');
// event_in_page_X =  pe('Instances edit page')
// event_in_page_Y =  pe('Instances create page')
export function prepareEvent(verb: string): EventAssemblerNoPayload;
// e = prepareEvent('Clicked locations dropdown', {location: 'IN'});
export function prepareEvent<Payload>(verb: string, payload: Payload): EventAssembler<Payload>;
export function prepareEvent<Payload>(
    verb: string,
    payload?: Payload
): EventAssemblerNoPayload | EventAssembler<Payload> {
    if (!payload) {
        const assembler = (source: string) => toEvent(source, verb);
        ((assembler as any) as VerbedEvent).verb = verb;
        return assembler;
    } else {
        const assembler = (source: string, prop: Payload) => ({
            ...prop,
            verb,
            source,
            type: `[${source}] ${verb}`,
        });
        ((assembler as any) as VerbedEvent).verb = verb;
        return assembler;
    }
}

// Concreate events generator function
// e = createEvent('Instances edit page', 'Clicked locations dropdown')
export function createEvent(source: string, verb: string): EventCreatorNoPayload;
// e = createEvent('Instances edit page', 'Clicked locations dropdown', {location: 'IN'})
export function createEvent<Payload>(source: string, verb: string, payload: Payload): EventCreator<Payload>;
export function createEvent<Payload>(
    source: string,
    verb: string,
    payload?: Payload
): EventCreatorNoPayload | EventCreator<Payload> {
    if (!payload) {
        const creator: EventCreatorNoPayload = () => toEvent(source, verb);
        ((creator as any) as VerbedEvent).verb = verb;
        return creator;
    } else {
        const creator = (params: Payload) => ({
            ...params,
            verb,
            source,
            type: `[${source}] ${verb}`,
        });
        ((creator as any) as VerbedEvent).verb = verb;
        return creator;
    }
}

type ExtractActionTypes<Creators extends readonly ActionCreator[]> = {
    [Key in keyof Creators]: Creators[Key] extends ActionCreator<infer T>
    ? T
    : never;
};

/*
Usage:
// e1 without payload
e1 = createEvent('Instances edit page', 'Clicked locations dropdown')
// e2 with payload
pe = prepareEvent('Clicked locations dropdown', payload)
e2 = pe('Instances setup page')

this.store.dispatch(e(e1)); this.store.dispatch(e(e2));

createReducer(
    INITIAL_STATE,
    when(pe, (state, payload) => new_state),
)

createEffect(() => this.actions$.pipe(
    onEvent(e1, e2),
    ...
))
*/

export function when<
    State, 
    Payload,
    EventCreators extends readonly EventCreator<Payload>[],
    Creators extends readonly ActionCreator[],>(
    ...args: [
        ...creators: EventCreators,
        reducer: OnReducer<State extends infer S ? S : never, Creators>
    ]
): ReducerTypes<State, Creators> {
    // reducers are not changed
    const reducer = args.pop() as OnReducer<any, Creators>;
    // args are left with 
    const types = (((args as unknown) as Creators).map(
        (creator) => creator.type
    ) as unknown) as ExtractActionTypes<Creators>;
    return { reducer, types };
}

export function onEvent(
    ...allowedTypes: Array<string | ActionCreator<string, Creator>>
  ): OperatorFunction<Action, Action> {
    return filter((action: Action) =>
      allowedTypes.some((typeOrActionCreator) => {
        if (typeof typeOrActionCreator === 'string') {
          // Comparing the string to type
          return typeOrActionCreator === action.type;
        }
        // We are filtering by ActionCreator
        return typeOrActionCreator.type === action.type;
      })
    );
  }