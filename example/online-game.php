<?php
/*
Template Name: Онлайн игра
*/
?>
<?php
header('Access-Control-Allow-Origin: *');

/* services */
function get_required_param($param_name) {
    if(!isset($_GET[$param_name])) {
        throw new Exception("parameter $param_name is undefined");
    } else {
        return $_GET[$param_name];
    }
}

function load_question_by_index($index) {
    $questions = get_field('questions');

    if($index >= count($questions)) {
        throw new Exception('wrond index');
    } else {
        return $questions[$index];
    }
}

function load_answer_by_index($question, $index) {
    if($index >= count($question['answers'])) {
        throw new Exception('wrond index');
    } else {
        return $question['answers'][$index];
    }
}

function dd($v){
    echo "<pre>";
    var_dump($v);
    echo "</pre>";
    die();
}

function generate_secret() {
    if(!session_id()) {
        session_start();
    }

    $_SESSION['secret'] = uniqid(null, true);
    wp_send_json_success($_SESSION['secret']);
}

function check_secret() {
    if(!session_id()) {
        session_start();
    }

    $secret = get_required_param('secret');

    if(!isset($_SESSION['secret'])) {
        throw new Exception('Secret were not passed');
    }

    if(strcmp($secret, $_SESSION['secret']) != 0) {
        throw new Exception('Secret is not valid');
    }
}

/* new game */
function new_game_scenario() {
    $number_of_questions = get_field('number_of_questions');
    $total_questions = count(get_field('questions'));

    $questions = get_random_questions($number_of_questions, $total_questions);

    foreach($questions as $k => $v) {
        foreach($questions[$k]['answers'] as $kk => $vv) {
            unset($questions[$k]['answers'][$kk]['is_correct']);
        }
    }

    wp_send_json_success($questions);
}

function get_random_questions($number_of_questions, $total_questions) {
    $questions = get_field('questions');
    $random_questions = [];

    $num_of_questions_to_get = $number_of_questions > $total_questions ? $total_questions : $number_of_questions;

    $random_question_indexes = array_rand($questions, $num_of_questions_to_get);

    if(!is_array($random_question_indexes)) {
        $question = $questions[$random_question_indexes];
        $question['id'] = $random_question_indexes;
        array_push($random_questions, $question);
    } else {
        foreach($random_question_indexes as $random_index) {
            $question =  $questions[$random_index];
            $question['id'] = $random_index;
            array_push($random_questions, $question);
        }
    }
    shuffle($random_questions);

    return $random_questions;
}

/* continue_game */
function continue_game_scenario() {
    $question_ids = explode(',', get_required_param('question_index'));

    $questions = get_field('questions');

    $requested_questions = [];

    foreach($question_ids as $id) {
        $question = $questions[$id];
        $question['id'] = $id;
        array_push($requested_questions, $question);
    }

    foreach($requested_questions as $k => $v) {
        foreach($requested_questions[$k]['answers'] as $kk => $vv) {
            unset($requested_questions[$k]['answers'][$kk]['is_correct']);
        }
    }

    wp_send_json_success($requested_questions);
}

/* check_answer */
function check_answer_scenario() {
    $question_index = get_required_param('question_index');
    $answer_index = get_required_param('answer_index');

    $question = load_question_by_index($question_index);
    $answer = load_answer_by_index($question, $answer_index);

    wp_send_json_success($answer['is_correct']);
}

function load_correct_answer() {
    $question_index = get_required_param('question_index');

    $question = load_question_by_index($question_index);

    $correct_index = array_search(true, array_column($question['answers'], 'is_correct'));

    wp_send_json_success($correct_index);
}

function load_discount_code() {
    $codes = get_field('discount');

    $correct_index = array_search(true, array_column($codes, 'is_allowed'));

    wp_send_json_success($codes[$correct_index]);
}

/* main */
try {
    switch ($_GET['game_mode']) {
        case 'generate_secret':
            generate_secret();
            break;
        case 'load_discount_code':
            check_secret();
            load_discount_code();
            break;
        case 'start_new_game':
            new_game_scenario();
            break;
        case 'continue_game':
            continue_game_scenario();
            break;
        case 'check_answer':
            check_answer_scenario();
            break;
        case 'load_correct_answer':
            check_secret();
            load_correct_answer();
            break;
        default:
            wp_send_json_error("undefined work mode");
            break;
    }
} catch (Exception $e) {
    wp_send_json_error($e->getMessage());
}

?>