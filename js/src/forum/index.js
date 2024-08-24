import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import UsersSearchSource from 'flarum/common/components/UsersSearchSource';
import LinkButton from 'flarum/common/components/LinkButton';
import IndexPage from 'flarum/forum/components/IndexPage';
import CommentPost from 'flarum/forum/components/CommentPost';
import LeaderBoardPage from './components/LeaderBoardPage';
import LeaderBoardList from './components/LeaderBoardList';
import LeaderBoardListItem from './components/LeaderBoardListItem';
import LeaderBoardState from './states/LeaderBoardState';
import SortMap from '../common/utils/SortMap';
import CheckableButton from './components/CheckableButton';
import Text from './models/Text';

// Allow other extensions to extend the page
export { LeaderBoardPage, LeaderBoardList, LeaderBoardListItem, LeaderBoardState, SortMap, CheckableButton };

export const linkGroupMentions = function () {
  if (app.forum.attribute('canSeeLeaderBoardLink') && app.forum.attribute('leaderBoardLinkGroupMentions')) {
    this.$('.GroupMention').each(function () {
      if ($(this).hasClass('GroupMention--linked')) return;

      const name = $(this).find('.GroupMention-name').text();
      const group = app.store.getBy('groups', 'namePlural', name.slice(1));

      if (group) {
        const link = $(`<a class="GroupMention-link" href="${app.route('nodeloc_leaderboard', { q: `group:${group.id()}` })}"></a>`);

        link.on('click', function (e) {
          m.route.set(this.getAttribute('href'));
          e.preventDefault();
        });

        $(this).addClass('GroupMention--linked').wrap(link);
      }
    });
  }
};

app.initializers.add('nodeloc-leaderboard', (app) => {
  app.routes.nodeloc_leaderboard = {
    path: '/leaderboard',
    component: LeaderBoardPage,
  };

  app.store.models['nodeloc-leaderboard-text'] = Text;

  extend(UsersSearchSource.prototype, 'view', function (view, query) {
    if (!view || !app.forum.attribute('canSeeLeaderBoardLink') || app.forum.attribute('leaderBoardDisableGlobalSearchSource')) {
      return;
    }

    query = query.toLowerCase();

    view.splice(
      1,
      0,
      m(
        'li',
        LinkButton.component(
          {
            href: app.route('nodeloc_leaderboard', { q: query }),
            icon: 'fas fa-search',
          },
          app.translator.trans('nodeloc-leaderboard.forum.search.users_heading', { query })
        )
      )
    );
  });

  extend(IndexPage.prototype, 'navItems', (items) => {
    if (app.forum.attribute('canSeeLeaderBoardLink') && app.forum.attribute('canSearchUsers')) {
      items.add(
        'nodeloc-leaderboard',
        LinkButton.component(
          {
            href: app.route('nodeloc_leaderboard'),
            icon: 'far fa-address-book',
          },
          app.translator.trans('nodeloc-leaderboard.forum.page.nav')
        ),
        85
      );
    }
  });

  extend(CommentPost.prototype, 'oncreate', linkGroupMentions);
  extend(CommentPost.prototype, 'onupdate', linkGroupMentions);
});

export * from './components';
export * from './searchTypes';
