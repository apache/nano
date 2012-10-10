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
npm run nock_off
```

check this [blogpost](http://writings.nunojob.com/2012/05/Mock-HTTP-Integration-Testing-in-Node.js-using-Nock-and-Specify.html) to learn more about how to write your own tests

[2]: http://github.com/dscape/nano/issues