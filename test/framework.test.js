import test from 'tape';
import turbine from '../src/index';

const framework = turbine();

test('initialize turbine', function(t) {
    t.ok(turbine, 'turbine');
    t.end();
});