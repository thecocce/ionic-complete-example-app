(function (){
	'use strict';

	angular.module('myTeams')
	.controller('TeamDetailController', ['$stateParams','eliteApi','$ionicPopup',TeamDetailController]);

	function TeamDetailController ($stateParams,eliteApi,$ionicPopup){
		var vm = this;

		vm.teamId = null;
		vm.teamName = null;
		vm.games = null;
		vm.teamStanding = null;
		vm.toggleFollow = toggleFollow;
		vm.following = null;

		activate();

		function activate() {
			vm.following = false;
			vm.teamId = Number($stateParams.id);
			vm.teamStanding = getTeamStanding();
			vm.teamName = getTeam().name;
			vm.games = getGames();
		}

		function toggleFollow(){
			if(!vm.following){
				var confirmPopup = $ionicPopup.confirm({
					title: "Unfollow?",
					template: 'Are you sure you want to unfollow?'
				});
				confirmPopup.then(function(res){
					if(!res){
						vm.following = !vm.following;
					}
				});
			}
		}


		function getLeagueData(){
			return eliteApi.getLeagueData();
		} 

		function getTeamStanding(){
			var divisions = getLeagueData().standings;
			var standings;
			var standing;
			for (var i = 0; i<divisions.length; i++) {
				standings = divisions[i].divisionStandings;
				for (var j = 0; j<standings.length; j++) {
					standing = standings[j];
					if(standing.teamId === vm.teamId){
						return standing;
					}
				}
			}
		}

		function getTeam(){
			var divisions = getLeagueData().teams;
			var divisionTeams;
			var team;
			for (var i = 0; i<divisions.length; i++) {
				divisionTeams = divisions[i].divisionTeams;
				for (var j = 0; j<divisionTeams.length; j++) {
					team = divisionTeams[j];
					if(team.id === vm.teamId){
						return team;
					}
				}
			}
		}
		
		function getGames(){
			return _.chain(getLeagueData().games)
					.filter(isTeamInGame)
					.map(function(item){
						var isTeam1 = (item.team1d === vm.teamId ? true: false);
						var oponnentName = isTeam1 ? item.team2 : item.team1;
						var scoreDisplay = getScoreDisplay(isTeam1, item.team1Score, item.team2Score);
						return {
							gameId: item.id,
							opponent: oponnentName,
							time: item.time,
							location: item.location,
							locationUrl: item.locationUrl,
							scoreDisplay: scoreDisplay,
							homeAway: (isTeam1 ? "vs." : "at")
						};
					}).value();
		}

		function isTeamInGame(item){
			return item.team1Id === vm.teamId || item.team2Id === vm.teamId;
		}

		function getScoreDisplay(isTeam1, team1Score, team2Score){
			if(team1Score && team2Score){
				var teamScore = (isTeam1 ? team1Score : team2Score);
				var opponentScore = (isTeam1 ? team2Score: team1Score);
				var winIndicator = teamScore > opponentScore ? "W: " : "L: ";
				return winIndicator + teamScore + "-" + opponentScore;
			}else{
				return "";
			}
		}
	}

})();