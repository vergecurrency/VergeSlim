<template>
  <div>
    <div class="columns has-text-centered">
      <div class="column">
        <b-icon icon="address-book" custom-size="6x"/>
        <h1 class="is-size-1 has-text-grey is-family-display contacts-display-title">
          Your Awesome Contacts 👨‍👩‍👦‍👦
        </h1>
      </div>
    </div>

    <div class="columns is-centered has-text-centered">
      <div class="column">
        <b-table :data="contacts" :columns="columns">
          <template slot-scope="props">
            <b-table-column field="name">{{ props.row.name }}</b-table-column>
            <b-table-column field="addresses">
              <ul>
                <li v-for="address in props.row.addresses" :key="address">{{ address }}</li>
              </ul>
            </b-table-column>
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'contacts-view',
  data () {
    return {
      contacts: [
        {
          name: 'Swen',
          addresses: ['Dajd09j20ejd2oje90dj2d09jd290', 'Dajd09j20ejd2oje90dj2d09jd290']
        },
        {
          name: 'Marple',
          addresses: ['Dajd09jdfdjd2oje90dj2d09jd290']
        }
      ],
      columns: [
        {
          label: 'Name',
          field: 'name',
          searchable: true
        },
        {
          label: 'Addresses',
          field: 'addresses',
          searchable: true
        }
      ]
    }
  }
}
</script>

<style scoped>
  .contacts-display-title {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow:
      0 0 10px rgba(124, 255, 242, 0.18),
      0 0 24px rgba(50, 239, 222, 0.24);
  }
</style>
