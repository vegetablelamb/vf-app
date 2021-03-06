pollingApp.controller('PollsController', function($window, $rootScope, $scope, $state, ipCookie) {

    $scope.polls                = [];
    $scope.answeredQuestions    = {};

    socket.emit('questionsRequest');

    $scope.generateCookie = function() {
        if(!ipCookie('answeredPolls')){
            ipCookie('answeredPolls', '{}');
        }
        if(!ipCookie('answered')){
            ipCookie('answered', '{}');
        }
    }

    $scope.refresh = function() {
        socket.emit('questionsRequest');
        $scope.checkAnsweredQuestions();
    }

    $scope.checkAnsweredQuestions = function() {
        var cookieData = ipCookie('answeredPolls');
        if (cookieData) {
            $scope.answeredQuestions = cookieData;
        }
    }

    $scope.isPollAnswered = function(poll) {

        var cookie = ipCookie('answered');
        return cookie[poll.id] ? true : false;
        //return $scope.answeredQuestions[poll.id] ? true : false;
    }

    $scope.selectAnswer = function(poll, answer) {
        if ($scope.answeredQuestions[poll.id]) {
            return false;
        }
        answer.times++;
        poll.question.times++;
        //console.log(answer);
        //answer.selected = true;
        $scope.updateAnswerCookie(poll, answer);
        $scope.updateCookie(poll);
        socket.emit('pollUpdate', poll);
    }

    $scope.updateAnswerCookie = function(poll, answer) {
        var cookie = ipCookie('answered');

        cookie[poll.id] = answer.text;

        ipCookie('answered', JSON.stringify(cookie), {expires: 99});

        $scope.refresh();
        //console.log('ipCookie.answered',ipCookie('answered'));
    }

    $scope.updateCookie = function(poll) {
        var cookie = ipCookie('answeredPolls');
        // if (cookie && JSON.stringify(cookie) !== '{}') {
        //     cookie = JSON.parse(JSON.stringify(cookie));
        //     //cookie = JSON.parse(cookie);
        // }else cookie = {};


        cookie[poll.id] = 'answered';

        ipCookie('answeredPolls', JSON.stringify(cookie), {expires: 99});
        //console.log('ipCookie',ipCookie('answeredPolls'));
        $scope.refresh();
        //console.log('ipCookie',ipCookie('answeredPolls'));
    }

    $scope.submitQuestion = function(form) {
        var answer;

        for (answer in form.answers) {
            form.answers[answer].times = 0;
        }

        socket.emit('newQuestion', {
            'id': $scope.polls.length,
            'question': {
                'text': form.newQuestion,
                'times': 0
            },
            'answers': form.answers
        });
    }

    $scope.$on('$destroy', function (event) {
        socket.removeAllListeners();
    });

    socket.on('pollUpdateSuccess', function(poll) {
        $scope.refresh();
    });

    socket.on('newQuestionSaved', function(data) {
        $scope.refresh();
        $state.go('admin.viewquestions');
    });

    socket.on('questionsData', function(data) {
        $scope.$apply(function() {
            $scope.polls = [];
            var poll,
                cookie = ipCookie('answered');

            for (poll in data) {
                if (data[poll]) {
                    if (data[poll].length > 0) {
                        data[poll] = JSON.parse(data[poll]);
                        // $scope.polls.unshift(data[poll]);
                        //console.log(data[poll].id);
                        //console.log(data[poll].answers);
                        var qId = data[poll].id;
                        for (var i = 0; i < data[poll].answers.length; i++) {
                            //console.log(qId, data[poll].answers[i].text);
                            //console.log(cookie);
                            if(cookie[qId] === data[poll].answers[i].text){
                                    //console.info('FOUND', data[poll]);
                                    data[poll].answers[i].selectedLocal = true;
                                    //console.info(data[poll].answers[i].selectedLocal);
                            }
                            // if(cookie[]){

                            // }
                        }
                        $scope.polls.unshift(data[poll]);

                    }
                }
            }
            //console.log($scope.polls);
        });
    });

    $scope.generateCookie();
    $scope.checkAnsweredQuestions();
});
