<template>
  <div id="previewer">
    <div class="bar">
      <button
        @click="back"
        class="action"
        :title="$t('files.closePreview')"
        :aria-label="$t('files.closePreview')"
        id="close"
      >
        <i class="material-icons">close</i>
      </button>

      <rename-button v-show="showRenameButton"></rename-button>
      <share-button v-show="showShareButton"></share-button>
      <move-button v-show="showMoveButton"></move-button>
      <delete-button v-show="showDeleteButton"></delete-button>
      <download-button v-show="showDownloadButton"></download-button>
      <info-button></info-button>
    </div>

    <button
      class="action"
      @click="prev"
      v-show="hasPrevious"
      :aria-label="$t('buttons.previous')"
      :title="$t('buttons.previous')"
    >
      <i class="material-icons">chevron_left</i>
    </button>
    <button
      class="action"
      @click="next"
      v-show="hasNext"
      :aria-label="$t('buttons.next')"
      :title="$t('buttons.next')"
    >
      <i class="material-icons">chevron_right</i>
    </button>

    <div class="preview">
      <img v-if="req.type.startsWith('image')" :src="raw" />
      <audio v-else-if="req.type.startsWith('audio')" :src="raw" autoplay controls></audio>
      <video v-else-if="req.type.startsWith('video')" :src="raw" autoplay controls>
        <track
          kind="captions"
          v-for="(sub, index) in subtitles"
          :key="index"
          :src="sub"
          :label="'Subtitle ' + index"
          :default="index === 0"
        />Sorry, your browser doesn't support embedded videos,
        but don't worry, you can
        <a
          :href="download"
        >download it</a>
        and watch it with your favorite video player!
      </video>
      <iframe v-else-if="isIframe" class="pdf" :src="iframe"></iframe>
      <a v-else :href="download">
        <h2 class="message">
          {{$t('files.cannotPreview')}}<br/><br/>
          {{ $t('buttons.download') }}
          <i class="material-icons">file_download</i>
        </h2>
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  baseURL,
  checkDocumentPreview,
  DownloadRole,
  DeleteRole,
  RenameRole,
  ShareRole,
  MoveRole
} from '@/utils/constants';
import { files as api } from '@/api';
import InfoButton from '@/components/buttons/Info';
import DeleteButton from '@/components/buttons/Delete';
import RenameButton from '@/components/buttons/Rename';
import DownloadButton from '@/components/buttons/Download';
import MoveButton from '@/components/buttons/Move'
import ShareButton from '@/components/buttons/Share'

export default {
  name: 'preview',
  components: {
    InfoButton,
    DeleteButton,
    RenameButton,
    DownloadButton,
    MoveButton,
    ShareButton
  },
  data: function() {
    return {
      previousLink: { id: '', name: '' },
      nextLink: { id: '', name: '' },
      listing: null,
      subtitles: []
    };
  },
  computed: {
    ...mapState(['req', 'user', 'oldReq', 'path']),
    hasPrevious() {
      return this.previousLink.id !== '';
    },
    hasNext() {
      return this.nextLink.id !== '';
    },
    download() {
      return `${baseURL}/api/files/${this.req.id}?alt=media`;
    },
    raw() {
      return `${this.download}&inline=true`;
    },
    iframe() {
      return api.preview(this.req.id);
    },
    isIframe() {
      return checkDocumentPreview(this.req.type);
    },
    showDownloadButton () {
      return !this.req.isDir && DownloadRole(this.req.role);
    },
    showDeleteButton () {
      // Can't delete a file that is being shared with you directly.
      if (this.req.permission && this.req.permission.fileID !== this.req.id) {
        return false;
      }
      
      return DeleteRole(this.req.role);
    },
    showRenameButton () {
      return RenameRole(this.req.role);
    },
    showShareButton () {
      return ShareRole(this.req.role);
    },
    showMoveButton () {
      return MoveRole(this.req.role);
    },
  },
  async mounted() {
    window.addEventListener('keyup', this.key);

    if (this.req.subtitles) {
      this.subtitles = this.req.subtitles.map(
        sub => `${baseURL}/api/raw${sub}?auth=${this.jwt}&inline=true`
      );
    }

    try {
      if (this.req.items) {
        this.updateLinks(this.req.items);
      } else {
        const parentIndex = this.path.findIndex(path => path.id === this.req.id) - 1;
        const res = await api.fetch(this.path[parentIndex >= 0 ? parentIndex : 0].id);
        this.updateLinks(res.items);
      }
    } catch (e) {
      this.$showError(e);
    }
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.key);
  },
  methods: {
    back() {
      const currentIndex = this.path.findIndex(path => path.id === this.req.id);
      this.$store.commit(
        'changeFolder',
        this.path[currentIndex > 0 ? currentIndex - 1 : 0].id
      );
      this.$store.commit('setReload', true);
    },
    prev() {
      const currentIndex = this.path.findIndex(path => path.id === this.req.id);
      this.$store.commit(
        'changeFolder',
        this.path[currentIndex > 0 ? currentIndex - 1 : 0].id
      );
      this.$store.commit('pushFolder', this.previousLink);
      this.$store.commit('setReload', true);
    },
    next() {
      const currentIndex = this.path.findIndex(path => path.id === this.req.id);
      this.$store.commit(
        'changeFolder',
        this.path[currentIndex > 0 ? currentIndex - 1 : 0].id
      );
      this.$store.commit('pushFolder', this.nextLink);
      this.$store.commit('setReload', true);
    },
    key(event) {
      event.preventDefault();
      if(event.key === "Escape") this.back();
      if (event.which === 13 || event.which === 39) {
        // right arrow
        if (this.hasNext) this.next();
      } else if (event.which === 37) {
        // left arrow
        if (this.hasPrevious) this.prev();
      }
    },
    updateLinks(items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].name !== this.req.name) {
          continue;
        }

        for (let j = i - 1; j >= 0; j--) {
          if (!items[j].isDir) {
            this.previousLink = { id: items[j].id, name: items[j].name };
            break;
          }
        }

        for (let j = i + 1; j < items.length; j++) {
          if (!items[j].isDir) {
            this.nextLink = { id: items[j].id, name: items[j].name };
            break;
          }
        }

        return;
      }
    }
  }
};
</script>
