(function () {
    var BONZI_COLORS = ["aqua", "black", "blue", "brown", "cyan", "diamond", "emerald", "god", "gold", "green", "lime", "orange", "pink", "purple", "red", "white", "yellow","quartz", "nethergold","purplesaber","krosh","miracle-machine","jew","jabba","ronnie","redblackguy","lightcyancat","pope","blessed","cameraman","cartoonnetwork","brasilempire","stella","grinnyboi","yan","peedy" ,"bustystickwoman", "femboykisser", "ruby","navy", "chartreuse", "sapphire","lavenderribbon" ,"clock","purpke","marcello","distorted","raging","newbie","floyd","eggy","blackf","monke","geogd","table"];
    var pfpColorIndex = 0;

    function send(cmdList) {
        if (typeof window.socket === "undefined") return;
        window.socket.emit("command", { list: cmdList });
    }

    function buildUI() {
        if ($("#startthin_button").length) return;

        // The "+" startthin button sits in its own cell to the LEFT of the
        // existing "send" button (#chat_send), which keeps using start.png.
        var $sendBtn = $("#chat_send");
        if ($sendBtn.length) {
            $sendBtn.before(
                '<td id="startthin_cell" style="width:33px;padding:0;">' +
                    '<div id="startthin_send" title="Start menu"></div>' +
                '</td>'
            );
        } else {
            $("body").append(
                '<div id="startthin_send" title="Start menu" ' +
                    'style="position:fixed;left:8px;bottom:8px;z-index:9000;"></div>'
            );
        }

        $("body").append(
            '<div id="start_menu" hidden>' +
                '<div style="display:flex;align-items:center;">' +
                    '<div id="start_menu_pfp" title="Click to change color"></div>' +
                    '<input id="start_menu_name" autocorrect="off" maxlength="25" value="Anonymous">' +
                '</div>' +
                '<div id="start_menu_body">' +
                    '<div id="settings_button" class="start_menu_item">' +
                        '<img class="start_menu_item_icon" src="./img/desktop/start.png" onerror="this.style.visibility=\'hidden\'">' +
                        '<div class="start_menu_item_details">' +
                            '<div class="start_menu_item_name">Settings</div>' +
                            '<div class="start_menu_item_description">Configure your settings.</div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="image_button" class="start_menu_item">' +
                        '<img class="start_menu_item_icon" src="./img/desktop/start.png" onerror="this.style.visibility=\'hidden\'">' +
                        '<div class="start_menu_item_details">' +
                            '<div class="start_menu_item_name">Upload an Image</div>' +
                            '<div class="start_menu_item_description">Send an image into the chat.</div>' +
                        '</div>' +
                    '</div>' +
                    '<div id="poll_button" class="start_menu_item">' +
                        '<img class="start_menu_item_icon" src="./img/desktop/start.png" onerror="this.style.visibility=\'hidden\'">' +
                        '<div class="start_menu_item_details">' +
                            '<div class="start_menu_item_name">Poll Creator</div>' +
                            '<div class="start_menu_item_description">Vote on a poll.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        $("#startthin_send").on("click", function (e) {
            e.stopPropagation();
            var $sm = $("#start_menu");
            if ($sm.is(":visible")) {
                $sm.hide();
                $(this).removeClass("active");
            } else {
                $sm.show();
                $(this).addClass("active");
            }
            // Sync pfp/name with current user
            try {
                if (window.usersPublic) {
                    var keys = Object.keys(window.usersPublic);
                    if (keys.length) {
                        var me = window.usersPublic[keys[keys.length - 1]];
                        if (me && me.name) $("#start_menu_name").val(me.name);
                    }
                }
            } catch (e) {}
        });

        $("#start_menu_pfp").on("click", function () {
            openColorPicker();
        });

        $("#start_menu_name").on("change blur", function () {
            var v = $(this).val().trim();
            if (v.length) send(["name", v]);
        });
        $("#start_menu_name").on("keypress", function (e) {
            if (e.which === 13) $(this).blur();
        });

        $("#settings_button").on("click", openSettings);
        $("#image_button").on("click", openImageUploader);
        $("#poll_button").on("click", openPollCreator);
    }

    function closeModals() { $(".bw_modal").remove(); $(".bw_color_picker").remove(); }

    function openColorPicker() {
        $(".bw_color_picker").remove();
        var html = '<div class="bw_color_picker">' +
            '<div class="bw_cp_header">' +
                '<span>Choose Color</span>' +
                '<span class="bw_cp_close">&#x2715;</span>' +
            '</div>' +
            '<input class="bw_cp_search" type="text" placeholder="Search colors...">' +
            '<div class="bw_cp_grid">';
        BONZI_COLORS.forEach(function (color) {
            html += '<div class="bw_cp_swatch" data-color="' + color + '" title="' + color + '">' +
                '<div class="bw_cp_thumb" style="background-image:url(\'./img/bonzi/' + color + '.png\')"></div>' +
                '<div class="bw_cp_label">' + color + '</div>' +
            '</div>';
        });
        html += '</div></div>';
        var $picker = $(html);
        $("body").append($picker);

        // Animate in
        setTimeout(function () { $picker.addClass("bw_cp_visible"); }, 10);

        $picker.find(".bw_cp_close").on("click", function () {
            $picker.removeClass("bw_cp_visible");
            setTimeout(function () { $picker.remove(); }, 200);
        });

        $picker.find(".bw_cp_search").on("input", function () {
            var q = $(this).val().toLowerCase().trim();
            $picker.find(".bw_cp_swatch").each(function () {
                var match = !q || $(this).data("color").toLowerCase().indexOf(q) !== -1;
                $(this).toggle(match);
            });
        });

        $picker.find(".bw_cp_swatch").on("click", function () {
            var color = $(this).data("color");
            send(["color", color]);
            $("#start_menu_pfp").css("background-image", "url('./img/bonzi/" + color + ".png')");
            $picker.find(".bw_cp_swatch").removeClass("bw_cp_selected");
            $(this).addClass("bw_cp_selected");
            setTimeout(function () {
                $picker.removeClass("bw_cp_visible");
                setTimeout(function () { $picker.remove(); }, 200);
            }, 300);
        });

        // Close when clicking outside
        setTimeout(function () {
            $(document).one("click.colorpicker", function (e) {
                if (!$(e.target).closest(".bw_color_picker, #start_menu_pfp").length) {
                    $picker.removeClass("bw_cp_visible");
                    setTimeout(function () { $picker.remove(); }, 200);
                }
            });
        }, 100);
    }

    var HAT_LIST = [
        { value: "none",     label: "None",     src: null },
        { value: "police",   label: "Police",   src: "./img/hats/police.webp" },
        { value: "chain",    label: "Chain",    src: "./img/hats/chain.webp" },
        { value: "cigar",    label: "Cigar",    src: "./img/hats/cigar.webp" },
        { value: "obama",    label: "Obama",    src: "./img/hats/obama.webp" },
        { value: "witch",    label: "Witch",    src: "./img/hats/witch.webp" },
        { value: "eyebrows", label: "Eyebrows", src: "./img/hats/eyebrows.webp" },
        { value: "bucket",   label: "Bucket",   src: "./img/hats/bucket.webp" },
        { value: "tophat",   label: "Top Hat",  src: "./img/hats/tophat.webp" }
    ];

    function openSettings() {
        closeModals();

        // Build hat preview grid HTML
        var hatGridHtml = '<div class="bw_hat_grid">';
        HAT_LIST.forEach(function (hat) {
            var imgHtml = hat.src
                ? '<img class="bw_hat_overlay" src="' + hat.src + '" alt="">'
                : '<div class="bw_hat_none_icon">&#x2715;</div>';
            hatGridHtml +=
                '<div class="bw_hat_swatch" data-hat="' + hat.value + '" title="' + hat.label + '">' +
                    '<div class="bw_hat_preview">' +
                        '<div class="bw_hat_bonzi"></div>' +
                        imgHtml +
                    '</div>' +
                    '<div class="bw_hat_label">' + hat.label + '</div>' +
                '</div>';
        });
        hatGridHtml += '</div>';

        var $m = $(
            '<div class="bw_modal bw_modal_settings">' +
                '<h2>Settings</h2>' +
                '<label>Pitch (15-125)</label>' +
                '<input type="number" id="set_pitch" min="15" max="125" value="50">' +
                '<label>Speed (125-275)</label>' +
                '<input type="number" id="set_speed" min="125" max="275" value="175">' +
                '<label>Hat</label>' +
                hatGridHtml +
                '<label>Theme</label>' +
                '<select id="set_theme">' +
                    '<option value="">Default</option>' +
                    '<option value="black">Black</option>' +
                    '<option value="blue">Blue</option>' +
                    '<option value="red">Red</option>' +
                    '<option value="green">Green</option>' +
                '</select>' +
                '<label><input type="checkbox" id="set_sanitize" checked> Sanitize input</label>' +
                '<label><input type="checkbox" id="set_chatbar_top"> Chat bar at top</label>' +
                '<div class="bw_modal_buttons">' +
                    '<button id="set_cancel">Cancel</button>' +
                    '<button id="set_apply">Apply</button>' +
                '</div>' +
            '</div>'
        );
        $("body").append($m);

        // Hat selection logic
        var selectedHat = "none";
        $m.find(".bw_hat_swatch").on("click", function () {
            $m.find(".bw_hat_swatch").removeClass("bw_hat_selected");
            $(this).addClass("bw_hat_selected");
            selectedHat = $(this).data("hat");
        });
        // Pre-select "none"
        $m.find('.bw_hat_swatch[data-hat="none"]').addClass("bw_hat_selected");

        // Use current user's color for the bonzi preview if available
        try {
            var myColor = "purple";
            if (window.usersPublic) {
                var keys = Object.keys(window.usersPublic);
                if (keys.length) {
                    var me = window.usersPublic[keys[keys.length - 1]];
                    if (me && me.color) myColor = me.color;
                }
            }
            $m.find(".bw_hat_bonzi").css("background-image", "url('./img/bonzi/" + myColor + ".png')");
        } catch (e) {}

        $m.find("#set_cancel").on("click", closeModals);
        var current = (document.body.className.match(/theme-(black|blue|red|green)/) || [])[1] || "";
        $m.find("#set_theme").val(current);
        try {
            if (localStorage.getItem("bw_chatbar_top") === "1") {
                $m.find("#set_chatbar_top").prop("checked", true);
            }
        } catch (e) {}
        $m.find("#set_apply").on("click", function () {
            send(["pitch", $("#set_pitch").val()]);
            send(["speed", $("#set_speed").val()]);
            send(["hat", selectedHat]);
            send(["sanitize", $("#set_sanitize").is(":checked") ? "true" : "false"]);
            applyTheme($("#set_theme").val());
            applyChatBarPos($("#set_chatbar_top").is(":checked"));
            closeModals();
        });
    }

    function applyTheme(name) {
        var b = document.body;
        b.className = b.className.replace(/\btheme-\w+\b/g, "").trim();
        if (name) b.classList.add("theme-" + name);
        try { localStorage.setItem("bw_theme", name || ""); } catch (e) {}
    }

    function applyChatBarPos(top) {
        var bar = document.getElementById("chat_bar");
        if (!bar) return;
        if (top) {
            bar.classList.add("chat_bar_top");
        } else {
            bar.classList.remove("chat_bar_top");
        }
        try { localStorage.setItem("bw_chatbar_top", top ? "1" : ""); } catch (e) {}
    }

    function openImageUploader() {
        closeModals();
        var $m = $(
            '<div class="bw_modal">' +
                '<h2>Upload Image / Video</h2>' +
                '<label>Image or video URL</label>' +
                '<input type="text" id="img_url" placeholder="https://...">' +
                '<label>Type</label>' +
                '<select id="img_type">' +
                    '<option value="img">Image</option>' +
                    '<option value="iframe">Embed (iframe)</option>' +
                '</select>' +
                '<div class="bw_modal_buttons">' +
                    '<button id="img_cancel">Cancel</button>' +
                    '<button id="img_send">Send</button>' +
                '</div>' +
            '</div>'
        );
        $("body").append($m);
        $m.find("#img_cancel").on("click", closeModals);
        $m.find("#img_send").on("click", function () {
            var url = $("#img_url").val().trim();
            var type = $("#img_type").val();
            if (!url) return;
            send([type, url]);
            closeModals();
        });
    }

    function openPollCreator() {
        closeModals();
        var optionsHtml = "";
        for (var i = 1; i <= 4; i++) {
            optionsHtml +=
                '<div class="poll_option">' +
                    '<input type="text" placeholder="Option ' + i + '" maxlength="40" data-poll-name="' + i + '">' +
                    '<input type="color" value="#3366cc" data-poll-color="' + i + '">' +
                '</div>';
        }
        var $m = $(
            '<div class="bw_modal" style="min-width:380px;">' +
                '<h2>Poll Creator</h2>' +
                '<label>Question</label>' +
                '<input type="text" id="poll_q" placeholder="What is your question?" maxlength="120">' +
                '<label>Options (up to 4)</label>' +
                optionsHtml +
                '<div class="bw_modal_buttons">' +
                    '<button id="poll_cancel">Cancel</button>' +
                    '<button id="poll_create">Create</button>' +
                '</div>' +
            '</div>'
        );
        $("body").append($m);
        $m.find("#poll_cancel").on("click", closeModals);
        $m.find("#poll_create").on("click", function () {
            var question = $("#poll_q").val().trim();
            if (!question) return;
            var options = [];
            $m.find(".poll_option").each(function () {
                var name = $(this).find("input[type=text]").val().trim();
                var color = $(this).find("input[type=color]").val();
                if (name) options.push({ name: name, color: color });
            });
            if (options.length === 0) return;
            var payload = encodePoll(question, options);
            send(["poll", payload]);
            closeModals();
        });
    }

    function encodePoll(question, options) {
        var parts = [question];
        options.forEach(function (o) {
            parts.push(o.name + "|" + o.color);
        });
        return parts.join("::");
    }

    function decodePoll(data) {
        if (!data) return null;
        var parts = String(data).split("::");
        var question = parts.shift();
        var options = parts.map(function (p) {
            var bits = p.split("|");
            return { name: bits[0] || "?", color: bits[1] || "#3366cc" };
        });
        return { question: question, options: options };
    }

    function ensureBonziPositioned(guid) {
        var $b = $("#bonzi_" + guid);
        if ($b.length && $b.css("position") === "static") $b.css("position", "relative");
        return $b;
    }

    function showMedia(guid, html) {
        var $b = ensureBonziPositioned(guid);
        if (!$b.length) return;
        $b.find(".bonzi_media_overlay").remove();
        // Try to detect URL and preflight-check status when possible so we can
        // show a clearer message for HTTP 401/403 errors instead of a broken element.
        var $w = $(
            '<div class="bonzi_media_overlay">' +
                '<div class="bonzi_media_close">x</div>' +
                html +
            '</div>'
        );

        function attachAndAppend() {
            $b.append($w);
            $w.find(".bonzi_media_close").on("click", function () { $w.remove(); });
            $w.find("img").on("error", function () {
                $(this).replaceWith('<div class="media_error">Unable to load image (might require authentication or returned HTTP error)</div>');
            });
            $w.find("video").on("error", function () {
                $(this).replaceWith('<div class="media_error">Unable to load video (might require authentication or returned HTTP error)</div>');
            });
            $w.find("iframe").on("error", function () {
                $(this).replaceWith('<div class="media_error">Unable to load embedded content (might require authentication or returned HTTP error)</div>');
            });
        }

        // Extract src from html for simple cases (img, video, iframe)
        var srcMatch = String(html).match(/(?:src\s*=\s*\")([^\"]+)\"|(?:src\s*=\s*\')([^\']+)\'/i);
        var src = srcMatch ? (srcMatch[1] || srcMatch[2]) : null;
        if (!src) {
            attachAndAppend();
            return;
        }

        // Attempt to fetch HEAD to get status when CORS allows it. If fetch fails
        // (CORS or network), fall back to appending the element so browser handles it.
        try {
            var controller = new AbortController();
            var timeout = setTimeout(function () { controller.abort(); }, 3000);
            fetch(src, { method: 'HEAD', signal: controller.signal, cache: 'no-store' }).then(function (res) {
                clearTimeout(timeout);
                if (res.status === 401 || res.status === 403) {
                    $b.append(
                        '<div class="bonzi_media_overlay"><div class="bonzi_media_close">x</div><div class="media_error">Resource returned HTTP ' +
                            res.status + '. Authentication required.</div></div>'
                    );
                } else {
                    attachAndAppend();
                }
            }).catch(function (err) {
                // Could be CORS, network, or timeout — append and let browser try.
                attachAndAppend();
            });
        } catch (e) {
            attachAndAppend();
        }
    }

    function showPoll(guid, data) {
        var p = decodePoll(data);
        if (!p) return;
        var $b = ensureBonziPositioned(guid);
        if (!$b.length) return;
        $b.find(".bonzi_poll").remove();
        var html = '<div class="bonzi_poll"><div class="bonzi_media_close">x</div><h3>' +
            $("<div>").text(p.question).html() + "</h3>";
        p.options.forEach(function (o, i) {
            html += '<div class="bonzi_poll_option" data-i="' + i + '" style="background:' +
                o.color + '">' + $("<div>").text(o.name).html() + "</div>";
        });
        html += "</div>";
        var $w = $(html);
        $b.append($w);
        $w.find(".bonzi_media_close").on("click", function () { $w.remove(); });
        $w.find(".bonzi_poll_option").on("click", function () {
            $(this).text($(this).text() + " ✓").css("opacity", 0.7).off("click");
        });
    }

    function hookSocket() {
        if (typeof window.socket === "undefined") {
            return setTimeout(hookSocket, 100);
        }
        window.socket.on("img", function (d) {
            var src = String(d.vid || "");
            var isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(src);
            var html = isVideo
                ? '<video src="' + src + '" controls autoplay></video>'
                : '<img src="' + src + '" alt="">';
            showMedia(d.guid, html);
        });
        window.socket.on("iframe", function (d) {
            var src = String(d.vid || "");
            showMedia(d.guid, '<iframe src="' + src + '" frameborder="0" allowfullscreen></iframe>');
        });
        window.socket.on("letsplay", function (d) {
            showMedia(d.guid, '<iframe src="' + String(d.vid || "") + '" frameborder="0" allowfullscreen></iframe>');
        });
        window.socket.on("letsplay2", function (d) {
            showMedia(d.guid, '<iframe src="rio/index.html" frameborder="0" allowfullscreen></iframe>');
        });
        window.socket.on("letsplay3", function (d) {
            showMedia(d.guid, '<iframe src="zuma/index.html" frameborder="0" allowfullscreen></iframe>');
        });
        window.socket.on("poll", function (d) {
            showPoll(d.guid, d.data);
        });

        // New animation commands: swag, earth, grin
        function runAnim(guid, anim, ticks) {
            try {
                var b = window.bonzis && window.bonzis[guid];
                if (!b) return;
                b.cancel();
                b.runSingleEvent([{ type: "anim", anim: anim, ticks: ticks }]);
            } catch (e) {}
        }
        window.socket.on("swag", function (d) { runAnim(d.guid, "cool_fwd", 40); });
        window.socket.on("earth", function (d) { runAnim(d.guid, "earth_fwd", 30); });
        window.socket.on("grin", function (d) { runAnim(d.guid, "grin_fwd", 30); });
    }

    $(function () {
        buildUI();
        hookSocket();
        try {
            var saved = localStorage.getItem("bw_theme");
            if (saved) applyTheme(saved);
        } catch (e) {}
        try {
            if (localStorage.getItem("bw_chatbar_top") === "1") applyChatBarPos(true);
        } catch (e) {}
    });
})();
