'use strict';

import Annotate from '../annotate';

describe('Annotate View', function() {

  beforeEach(() => {
    this.annotate = new Annotate();
  });

  it('Should run a few assertions', () => {
    expect(this.annotate).toBeDefined();
  });

});
