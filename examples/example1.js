import decorate from '../src/decorator';

function add(a, b) {
  return a + b;
}

// create your service
const CalcService = {
  add,
};

// decorate it, it will mutate CalcService
decorate(CalcService, 'app:CalcService');

export default CalcService;


CalcService.add(1, 3); // returns 4
