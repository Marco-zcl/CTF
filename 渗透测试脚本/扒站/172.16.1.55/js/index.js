$(function() {

	var $menu = $("#frame-menu");
	var choice = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var tpyesPref = {
		0 : "question_",
		1 : "single_",
		2 : "chaos_",
	}
	var typesName = {
		0 : "理论答题",
		1 : "单兵闯关",
		2 : "分组混战",
	}
	var typesQuestion = {
		0 : "",
		1 : "单选",
		2 : "多选",
		3 : "填空",
	}
	var typesStep = {
		0 : "",
		1 : "KEY",
		2 : "FLAG",
	}
	var typesGen = {
		0 : function(json) {
			var $text = $("<textarea>", {
				"class" : "form-control",
				name : "value"
			});
			return $text;
		},
		1 : function(json) {
			var $select = $("<select>", {
				"class" : "form-control",
				name : "value"
			});
			$select.append($("<option>", {
				value : ""
			}));
			var tips = json.questionTips.split(/\r?\n/)
			var length = tips.length;
			for (var i = 0; i < length; i++) {
				$select.append($("<option>", {
					value : choice[i],
					text : choice[i]
				}));
			}
			return $select;
		},
		2 : function(json) {
			var $select = $("<select>", {
				"class" : "form-control inline",
				name : "value",
				multiple : "multiple"
			});
			var tips = json.questionTips.split(/\r?\n/)
			var length = tips.length;
			for (var i = 0; i < length; i++) {
				$select.append($("<option>", {
					value : choice[i],
					text : choice[i]
				}));
			}
			return $select;
		},
		3 : function(json) {
			var $text = $("<textarea>", {
				"class" : "form-control",
				name : "value"
			});
			return $text;
		}
	}

	var $l = $menu;
	var $r = $("#frame-content");
	var $d = $("#frame-divider");
	var $p = $d.closest(".container-fluid");
	var $body = $("body:eq(0)");

	var min = 0;
	var base = $l.position().left;

	function frameDivider() {
		var max = Math.floor($body.innerWidth());
		if (max < 992) {
			$d.height(0);
			$d.css("min-height", 0);
			$l.css("width", "");
			$r.css("width", "");
			return;
		}

		var cur = Math.ceil($l.outerWidth(true) + $r.outerWidth(true));
		var sub = max - cur;
		if (document.scrollingElement.scrollHeight != document.scrollingElement.clientHeight) {
			sub -= 20;
		}
		if (sub != 0) {
			$r.width($r.width() + sub);
		}
		$d.height(0);
		$d.css("min-height", 0);
		$d.height($p.height());
		$d.css("min-height", $win.height() - ($body.height() - $p.height()));
		$d.css("left", base + $l.outerWidth(true));
	}
	$(frameDivider);
	$win.on("resize", function() {
		frameDivider();
	})

	$d.on("mousedown", function(e) {
		var lw = $l.width();
		var rw = $r.width();
		var aw = lw + rw;
		var ex = e.clientX;

		$doc.on("mousemove.frameDivider", function(e) {
			var curLw = lw + (e.clientX - ex);
			if (curLw < min) {
				curLw = min;
			}
			if (aw - curLw < min) {
				curLw = aw - min;
			}
			var curRw = aw - curLw;
			$l.width(Math.ceil(curLw));
			$r.width(Math.floor(curRw));
			frameDivider();
		});
		$doc.one("mouseup", function() {
			$doc.off("mousemove.frameDivider");
		});
		return false;
	});

	$("#frame-content>[id]").hide();
	$menu.on("click", "a", function(e) {
		e.preventDefault();
		var $this = $(this);
		var href = $this.attr("href");
		if (href.startsWith("#menu_")) {
			frameDivider();
			return;
		}
		var info = href.split("_");
		var $content = $("#content_" + info[0]);

		$menu.find(".active").removeClass("active");
		$this.addClass("active");

		$("#frame-content>[id]").hide();
		$content.show();

		if (!info[1]) {
			return;
		}
		var $tips = $content.find("[data-elm='questionTipsText']");
		var $val = $content.find("[data-elm='valueElms']");
		var $attack = $content.find("[data-elm='attack']");
		var $deffence = $content.find("[data-elm='deffence']");
		var $answer = $content.find("[data-elm='answerElms']");
		$attack.html("");
		$deffence.html("");
		$tips.html("");
		$val.html("");

		function genQuestion(json) {
			if (json.questionType == null) {
				$("#frame-content>[id]:visible").hide();
				frameDivider();
				return;
			}
			json.infoId = info[1];
			json.paperId = info[2];
			json.questionId = info[3];

			json.questionTypeText = typesQuestion[json.questionType];
			if (json.answers.length) {
				var last = json.answers[json.answers.length - 1];
				json.stepType = last.stepType
				json.ip = last.ip;
				if (json.questionType == 2) {
					json.value = last.value.split(",");
				} else {
					json.value = last.value;
				}
			}

			if (json.questionTips) {
				var items = json.questionTips.split(/\r?\n/);
				for ( var i in items) {
					$tips.append($("<div>", {
						text : choice[i] + "、" + items[i]
					}));
				}
			}
			if (json.attackInfos) {
				for ( var i in json.attackInfos) {
					var item = json.attackInfos[i];
					$attack.append($("<div>", {
						html : item.url ? $("<a>", {
							text : item.name + " " + (item.ip || ""),
							href : item.url
						}) : $("<span>", {
							text : item.name + " " + (item.ip || "")
						})
					}));
				}
			}
			if (json.deffenceInfos) {
				for ( var i in json.deffenceInfos) {
					var item = json.deffenceInfos[i];
					$deffence.append($("<div>", {
						html : item.url ? $("<a>", {
							text : item.name + " " + (item.ip || ""),
							href : item.url
						}) : $("<span>", {
							text : item.name + " " + (item.ip || "")
						})
					}));
				}
			}
			$answer.html("");
			var infos = $answer.attr("data-value");
			if (infos) {
				infos = infos.split(",");
				for ( var i in json.answers) {
					var answer = json.answers[i];
					var html = [];
					for ( var j in infos) {
						var text = "";
						with (answer) {
							text = eval(infos[j]);
						}
						html.push($("<td>", {
							text : text
						}))
					}
					$answer.prepend($("<tr>", {
						html : html
					}))
				}
			}

			$val.append(typesGen[json.questionType](json));

			$.json2form(json, $content);

			if (json.complete) {
				$content.find("[type='submit']").attr("disabled", true);
			} else {
				$content.find("[type='submit']").attr("disabled", false);
			}
		}
		$.ajax({
			url : "front/getQuestion.json",
			type : "get",
			data : {
				infoId : info[1],
				paperId : info[2],
				questionId : info[3],
			},
			async : false,
			success : function(json) {
				genQuestion(json.data);
				frameDivider();
			}
		});
	});

	$doc.on("ajaxSubmitted", "form[data-url]", function() {
		$menu.find(".active").click();
	});

	$doc.on("change", "[name='stepType']", function() {
		var $this = $(this);
		var $form = $this.closest("form");
		var $ip = $form.find("[name='ip']").closest("tr");
		var val = $this.val();
		if (val == 2) {
			$ip.show();
		} else {
			$ip.hide();
		}
	});

	$.ajax({
		url : "front/listMenu.json",
		type : "get",
		dataType : "json",
		async : false,
		success : function(json) {
			var $group = $menu.find(".list-group");
			$group.append($("<a>", {
				"class" : "list-group-item list-lv1",
				href : "home",
				text : "首页"
			}));

			var menu = {};
			for ( var i in typesName) {
				menu[i] = {};
			}

			for ( var i in json.data) {
				var item = json.data[i];

				if (!menu[item.taskType][item.taskName]) {
					menu[item.taskType][item.taskName] = [];
				}

				var href = tpyesPref[item.taskType];
				href += item.infoId + "_"
				href += item.paperId + "_"
				href += item.questionId
				if (item.taskType == 2) {
					var $question = $("<a>", {
						"class" : "list-group-item list-lv3",
						href : href,
						text : "场景" + item.questionIndex
					})
				} else {
					var $question = $("<a>", {
						"class" : "list-group-item list-lv3",
						href : href,
						text : "第" + item.questionIndex + "题"
					})
				}

				menu[item.taskType][item.taskName].push($question);
			}
			for ( var i in menu) {
				$group.append($("<a>", {
					"class" : "list-group-item list-lv1 collapsed",
					text : typesName[i],
					href : "#menu_" + i,
					"data-toggle" : "collapse",
				}));
				var $lv1 = $("<div>", {
					id : "menu_" + i,
					"class" : "collapse"
				});
				$group.append($lv1);

				var taskIndex = 0;
				for ( var j in menu[i]) {
					$lv1.append($("<a>", {
						"class" : "list-group-item list-lv2 collapsed",
						text : j,
						href : "#menu_" + i + "_" + taskIndex,
						"data-toggle" : "collapse",
					}));
					var $lv2 = $("<div>", {
						id : "menu_" + i + "_" + taskIndex,
						"class" : "collapse"
					});
					taskIndex++;
					$lv1.append($lv2);
					for ( var k in menu[i][j]) {
						$lv2.append(menu[i][j][k]);
					}
				}
			}
			$group.find("a:first").click();
		}
	});

	var $timeouts = [];
	for (var i = 0; i < 3; i++) {
		$timeouts[i] = $("[data-timeout='" + i + "']");
	}
	var shifts = [ 60 * 60, 60, 1 ];
	var units = [ "小时", "分", "秒" ];
	var waring = 60
	setInterval(function() {
		var now = Date.now() + INFO.difference;
		for (var i = 0; i < 3; i++) {
			var $timeout = $timeouts[i];
			var timeout = INFO.end[i] - Math.max(INFO.begin[i], now);
			var text = "";
			if (timeout < waring) {
				$timeout.addClass("alert-danger");
			} else {
				$timeout.removeClass("alert-danger");
			}
			if (timeout <= 0) {
				text = "结束";
			} else {
				timeout = Math.floor(timeout / 1000);
				for ( var j in shifts) {
					if (timeout >= shifts[j] || text.length > 0) {
						text += Math.floor(timeout / shifts[j]) + units[j];
						timeout %= shifts[j];
					}
				}
			}
			$timeout.text(text);
		}
	}, 1000);

	$("#answerLogModal").on("show.bs.modal", function() {
		var $table = $("#answerLogModal .table-prop");
		$.ajax({
			url : "/front/info.json",
			type : "get"
		}).done(function(json) {
			$.json2form(json.data, $table, false);
		})
	});
});