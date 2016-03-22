import { takeLatest, takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { sendUpdateData, sendAddData, getData } from './utils';
import {
	fetchData,
	FETCH_DATA,
	UPDATE_TRANSLATION,
	updateTranslation,
	ADD_TRANSLATION,
	addTranslation
	//, updateKey
	//, updateWords
	//, addKey
	//, addWords
	/*,
	addTranslation,
	ADD_TRANSLATION*/
} from '../redux/actions';

//---------------------------------------------------------
/**
 * Get All the Translation from a namespace
 */

function getDataFromNameSpace( { id } ) {
	return getData( 'namespace', { id } );
}

export function* genGetDataFromNameSpace( action ) {
	try {
		const data = yield call( getDataFromNameSpace, action.payload );
		if ( data.error ) yield put( fetchData.error( data.error ) );
		else yield put( fetchData.success( data ) );
	} catch ( e ) {
		yield put( fetchData.error( e.message ) );
	}
}

export function* serviceFetchData() {
	yield * takeLatest( FETCH_DATA.REQUEST, genGetDataFromNameSpace );
}

//---------------------------------------------------------

/**
 * Update a Translation
 * --> update the key and the words ( en, fr, nl )
 */

function* genUpdateWordKey( { words, key } ) {
	yield [
		sendUpdateData( 'translation', words ),
		sendUpdateData( 'key', key )
	];
}

function* genUpdateTranslation( action ) {

	try {
		const data = yield call( genUpdateWordKey, action.payload );
		if ( data.error ) yield put( updateTranslation.error( data.error ) );
		else yield put( updateTranslation.success( data ) );
	} catch ( e ) {
		yield put( updateTranslation.error( e.message ) );
	}
}

export function* serviceUpdateTranslation() {
	yield * takeEvery( UPDATE_TRANSLATION.REQUEST, genUpdateTranslation );
}

//---------------------------------------------------------

/**
 * Add a New Translation
 */

function sendAddTranslation( { key, en, fr, nl, idTS } ) { return sendAddData( 'translation', { key, en, fr, nl, idTS } ); }

function* genAddTranslation( action ) {

	try {
		const data = yield call( sendAddTranslation, action.payload );
		if ( data.error ) yield put( addTranslation.error( data.error ) );
		else yield put( addTranslation.success( data ) );
	} catch ( e ) {
		yield put( addTranslation.error( e.message ) );
	}
}

export function* serviceAddTranslation() {
	yield * takeLatest( ADD_TRANSLATION.REQUEST, genAddTranslation );
}

//---------------------------------------------------------
// LOGIN
// function * authorize( credentials ) {
// 	try {
// 		const token = yield call( api.authorize, credentials )
// 		yield put( login.success( token ) )
// 	} catch ( error ) {
// 		yield put( login.error( error ) )
// 	}
// }
//
// function * authAndRefreshTokenOnExpiry( name, password ) {
// 	let token = yield call( authorize, { name, password } )
// 	while ( true ) {
// 		yield call( delay, token.expires_in )
// 		token = yield call( authorize, { token } )
// 	}
// }
//
// function * serviceAuth() {
// 	while ( true ) {
// 		const { name, password } = yield take( LOGIN.REQUEST )
//
// 		yield race( [
// 			take( LOGOUT ),
// 			call( authAndRefreshTokenOnExpiry, name, password )
// 		] )
// 	}
// }


import m from 'mithril';
import { connect } from '../redux/mithril-redux';
//import Velocity from 'velocity-animate';

import notification from 'polythene/notification/notification';
import button from 'polythene/button/button';
import 'polythene/theme/theme';

const view = ( /*c, { notification: { error } } */ ) => {
	return m( 'div', [
		m.component( button, {
			label: 'Button',
			raised: true,
			events: {
				onclick: () => {
					notification.show( {
						title: 'This is the message',
						containerSelector: '#notifications'
					} );

					notification.show( {
						title: 'This is a second message',
						containerSelector: '#notifications'
					} );
				}
			}
		} ),
		m( '#notifications', m.component( notification ) )
	] );
};

const Notification = {
	view
};
const comp = connect( state => ( {
	notification: state.notification
} ) )( Notification );
export default comp;

if ( user ) {
	console.log('THIS IS A TEST');
	console.log( `This ${is} also awesome`);
}

import _ from 'lodash';
import { defaultEntry } from '../../settings';
import {
	FETCH_DATA,
	UPDATE_TRANSLATION,
	ADD_TRANSLATION
} from '../actions';

/*eslint indent: [2, "tab", {"SwitchCase": 1}]*/

const dataReducer = ( state = {}, action ) => {

	switch ( action.type ) {
		case FETCH_DATA.SUCCESS:
			{
				const namespace = {
					id: _.first( action.data ).idNameSpace,
					label: _.first( action.data ).label
				};
				const wkt = _.reduce( action.data, ( acc, o ) => {
					acc.words.push( { en: o.en, idwe: o.idwe, fr: o.fr, idwf: o.idwf, nl: o.nl, idwn: o.idwn } );
					acc.keys.push( { key: o.key, idKey: o.idKey } );
					acc.translations.push( { idTranslation: o.idTranslation, idwe: o.idwe, idwf: o.idwf, idwn: o.idwn } );
					acc.mappingKLN.push( { idKey: o.idKey, idKTMapping: o.idKTMapping, idTranslation: o.idTranslation } );
					acc.translationSet.push( { id: o.idTranslationSet, label: o.label } );
					return acc;
				}, { words: [], keys: [], translations: [], mappingKLN: [], translationSet: [] } );

				return {
					...state,
					keys: wkt.keys,
					words: wkt.words,
					translations: wkt.translations,
					mappingKLN: wkt.mappingKLN,
					namespace,
					translationSet: _.uniqBy( wkt.translationSet, 'id' ),
					data: action.data
				};
			}
		case UPDATE_TRANSLATION.SUCCESS:
			{
				console.log( action ); //eslint-disable-line
				return state;
			}
		case ADD_TRANSLATION.SUCCESS:
			{
				//TODO
				const data = [ ...state.data,
					defaultEntry( 'key', 0, 'label', 0, state.namespace.label, state.namespace.id )
				];
				return {
					...state,
					data
				};
			}
		default:
			{
				return state;
			}
	}
};

export default dataReducer;
