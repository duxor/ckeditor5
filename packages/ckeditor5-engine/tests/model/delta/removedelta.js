/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: model, delta */

import { getNodesAndText } from '/tests/engine/model/_utils/utils.js';
import Document from '/ckeditor5/engine/model/document.js';
import Position from '/ckeditor5/engine/model/position.js';
import Range from '/ckeditor5/engine/model/range.js';
import Element from '/ckeditor5/engine/model/element.js';
import Text from '/ckeditor5/engine/model/text.js';
import RemoveDelta from '/ckeditor5/engine/model/delta/removedelta.js';

describe( 'Batch', () => {
	let doc, root, div, p, batch, chain, range;

	beforeEach( () => {
		doc = new Document();
		root = doc.createRoot();

		div = new Element( 'div', [], new Text( 'foobar' ) );
		p = new Element( 'p', [], new Text( 'abcxyz' ) );

		div.insertChildren( 0, [ new Element( 'p', [], new Text( 'gggg' ) ) ] );
		div.insertChildren( 2, [ new Element( 'p', [], new Text( 'hhhh' ) ) ] );

		root.insertChildren( 0, [ div, p ] );

		batch = doc.batch();

		// Range starts in ROOT > DIV > P > gg|gg.
		// Range ends in ROOT > DIV > ...|ar.
		range = new Range( new Position( root, [ 0, 0, 2 ] ), new Position( root, [ 0, 5 ] ) );
	} );

	describe( 'remove', () => {
		it( 'should remove specified node', () => {
			batch.remove( div );

			expect( root.maxOffset ).to.equal( 1 );
			expect( root.childCount ).to.equal( 1 );
			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should remove any range of nodes', () => {
			batch.remove( range );

			expect( getNodesAndText( Range.createIn( root.getChild( 0 ) ) ) ).to.equal( 'PggParPhhhhP' );
			expect( getNodesAndText( Range.createIn( root.getChild( 1 ) ) ) ).to.equal( 'abcxyz' );
		} );

		it( 'should create minimal number of operations when removing a range', () => {
			batch.remove( range );

			expect( batch.deltas.length ).to.equal( 1 );
			expect( batch.deltas[ 0 ].operations.length ).to.equal( 2 );
		} );

		it( 'should be chainable', () => {
			chain = batch.remove( range );

			expect( chain ).to.equal( batch );
		} );

		it( 'should add delta to batch and operation to delta before applying operation', () => {
			sinon.spy( doc, 'applyOperation' );
			batch.remove( div );

			const correctDeltaMatcher = sinon.match( ( operation ) => {
				return operation.delta && operation.delta.batch && operation.delta.batch == batch;
			} );

			expect( doc.applyOperation.calledWith( correctDeltaMatcher ) ).to.be.true;
		} );
	} );
} );

describe( 'RemoveDelta', ()=> {
	it( 'should provide proper className', () => {
		expect( RemoveDelta.className ).to.equal( 'engine.model.delta.RemoveDelta' );
	} );
} );
