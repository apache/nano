everyone is welcome to contribute with patches, bug-fixes and new features

1. create an [issue][2] on github so the community can comment on your idea
2. fork `nano` in github
3. create a new branch `git checkout -b my_branch`
4. create tests for the changes you made
5. make sure you pass both existing and newly inserted tests
6. commit your changes
7. push to your branch `git push origin my_branch`
8. create a pull request

to run tests make sure you npm test but also run tests without mocks:

``` sh
npm run unmocked
npm run mocked
npm test
```

check this [blogpost](http://writings.nunojob.com/2012/05/Mock-HTTP-Integration-Testing-in-Node.js-using-Nock-and-Specify.html) to learn more about how to write your own tests

please fix all issues identified in the pre-commit hooks before sending your patch. if you don't, we will close the patch and ask you to re-open it once you have:

1. 100% code coverage
2. proper codestyle
3. linted all your code

even in this state, if you changed something you need to add appropriate tests.

you can control verbosity during tests using

```
DEBUG=* node your_nano_scripts.js
```

you can turn nocks on and off using the `NOCK_OFF` environment variable.

[2]: http://github.com/dscape/nano/issues
