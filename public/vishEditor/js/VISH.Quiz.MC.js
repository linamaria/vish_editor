VISH.Quiz.MC = (function(V,$,undefined){

	var init = function(){
		_loadEvents();
	};

	var _loadEvents = function(){
	};

	/* Render the quiz in the DOM */
	var render = function(slide,template){
		var quizId = slide.quizId;
		var container = $("<div id='"+quizId+"' class='quizContainer mcContainer' type='"+V.Constant.QZ_TYPE.MCHOICE+"'></div>");

		var multipleAnswer = false;
		var inputType = 'radio';
		if((slide.extras)&&(slide.extras.multipleAnswer===true)){
			multipleAnswer = true;
			inputType = 'checkbox';
			$(container).attr("multipleAnswer",true);
		}

		//Question
		var questionWrapper = $("<div class='mc_question_wrapper, mc_question_wrapper_viewer'></div>");
		$(questionWrapper).html(slide.question.wysiwygValue);
		$(container).append(questionWrapper);

		//Options
		var optionsWrapper = $("<table cellspacing='0' cellpadding='0' class='mc_options'></table>");

		for(var i=0; i<slide.choices.length; i++){
			var option = slide.choices[i];
			var optionWrapper = $("<tr class='mc_option' nChoice='"+(i+1)+"'></tr>");
			var optionBox = $("<td><input class='mc_box' type='"+inputType+"' name='mc_option' value='"+i+"'/></td>");
			var optionIndex = $("<td><span class='mc_option_index mc_option_index_viewer'>"+String.fromCharCode(96+i+1)+") </span></td>");
			var optionText = $("<td><div class='mc_option_text mc_option_text_viewer'></div></td>");
			$(optionText).html(option.wysiwygValue);

			$(optionWrapper).append(optionBox);
			$(optionWrapper).append(optionIndex);
			$(optionWrapper).append(optionText);
			$(optionsWrapper).append(optionWrapper);
		}

		$(container).append(optionsWrapper);

		var quizButtons = V.Quiz.renderButtons(slide.selfA);
		$(container).append(quizButtons);

		return V.Utils.getOuterHTML(container);
	};


	/* 
	* Methods used for Self-assesment 
	*/

	/* Update UI after answer */
	var onAnswerQuiz = function(quiz,options){
		var afterAnswerAction = ((typeof options.afterAnswerAction != "undefined")&&(typeof options.afterAnswerAction == "string")) ? options.afterAnswerAction : "disabled";
		var canRetry = ((typeof options.canRetry != "undefined")&&(typeof options.canRetry == "boolean")) ? options.canRetry : false;
		
		var answeredQuiz = false;
		var answeredQuizCorrectly = false;
		var answeredQuizWrong = false;

		var quizJSON = V.Quiz.getQuiz($(quiz).attr("id"));
		var quizChoices = quizJSON.choices;

		//Color correct and wrong answers
		$(quiz).find("input[name='mc_option']").each(function(index,radioBox){
			var answerValue = parseInt($(radioBox).attr("value"));
			var choice = quizChoices[answerValue];

			if($(radioBox).is(':checked')){
				var trAnswer = $("tr.mc_option").has(radioBox);
				if(choice.answer===true){
					$(trAnswer).addClass("mc_correct_choice");
					answeredQuizCorrectly = true;
				} else if(choice.answer===false){
					$(trAnswer).addClass("mc_wrong_choice");
					answeredQuizWrong = true;
				}
				answeredQuiz = true;
			}
		});

		answeredQuizCorrectly = (answeredQuizCorrectly)&&(!answeredQuizWrong);

		var willRetry = (canRetry)&&(answeredQuizCorrectly===false);

		if(!willRetry){
			//Look and mark correct answers
			var trCorrectAnswers = [];
			for (var key in quizChoices){
				if(quizChoices[key].answer===true){
					//Get correct choice
					var trCorrect = $(quiz).find("tr.mc_option")[key];
					trCorrectAnswers.push($(quiz).find("tr.mc_option")[key]);
					if(answeredQuiz){
						$(trCorrect).addClass("mc_correct_choice");
					}
				}
			}
		}

		//Unfulfilled quiz
		if(!answeredQuiz){
			if(!willRetry){
				//Mark correct answers
				$(trCorrectAnswers).each(function(index,trCorrect){
					$(trCorrect).find("input[name='mc_option']").attr("checked","checked");
				});
			}
		}

		if(willRetry){
			//Retry
			_disableQuiz(quiz);
			V.Quiz.retryAnswerButton(quiz);
		} else {
			switch(afterAnswerAction){
				case "continue":
					V.Quiz.continueAnswerButton(quiz);
					break;
				case "disabled":
				default:
					disableQuiz(quiz);
					break;
			};
		}
	};

	/* Reset UI to make possible to answer again the quiz */
	var onRetryQuiz = function(quizDOM){
		$(quizDOM).find("tr").removeClass("mc_correct_choice");
		$(quizDOM).find("tr").removeClass("mc_wrong_choice");
		$(quizDOM).find("input[name='mc_option']").removeAttr("checked");
		_enableQuiz(quizDOM);
		V.Quiz.enableAnswerButton(quizDOM);
	};

	/* 
	* Methods used for Real Time Quizzes 
	*/

	var getReport = function(quiz){
		var report = {};
		report.answers = [];

		$(quiz).find("input[name='mc_option']").each(function(index,radioBox){
			if($(radioBox).is(':checked')){
				report.answers.push({no: (index+1).toString(), answer: "true"});
			}
		});

		report.empty = (report.answers.length===0);
		return report;
	};

	var disableQuiz = function(quiz){
		_disableQuiz(quiz);
		V.Quiz.disableAnswerButton(quiz);
	};

	var _disableQuiz = function(quiz){
		$(quiz).find("input[name='mc_option']").attr("disabled","disabled");
	};

	var _enableQuiz = function(quiz){
		$(quiz).find("input[name='mc_option']").removeAttr("disabled");
	};

	return {
		init                : init,
		render              : render,
		onAnswerQuiz        : onAnswerQuiz,
		onRetryQuiz			: onRetryQuiz,
		getReport           : getReport,
		disableQuiz         : disableQuiz
	};
	
}) (VISH, jQuery);