import decorate from '../src/decorator';

async function getUser(id) {
  return await new Promise((resolve) => {
    setTimeout(() => resolve({ id, username: 'john' }), 100);
  });
}

getUser.params = ['id'];


// create your service
const UserService = {
  getUser,
};

// decorate it, it will mutate UserService
decorate(UserService, 'app:UserService');

export default UserService;


async function run() {
  await UserService.getUser(1); // returns { id: 1, username: 'john' }
  await UserService.getUser(222); // throws 'User not found'
}

run();
