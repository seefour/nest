'use strict';

import Segment from '../segment';

describe('Segment View', function() {

  beforeEach(() => {
    this.segment = new Segment();
  });

  it('Should run a few assertions', () => {
    expect(this.segment).toBeDefined();
  });

});
